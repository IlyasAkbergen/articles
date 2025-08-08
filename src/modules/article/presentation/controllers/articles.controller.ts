import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ValidationPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import {
  CreateArticleCommand,
  UpdateArticleCommand,
  DeleteArticleCommand,
  PublishArticleCommand,
  UnpublishArticleCommand,
} from '../../application/commands';
import {
  GetArticleQuery,
  GetAllArticlesQuery,
  GetArticlesByAuthorQuery,
} from '../../application/queries';
import {
  CreateArticleRequestDto,
  UpdateArticleRequestDto,
  PublishArticleRequestDto,
} from '../dtos/request.dtos';
import { PaginationRequestDto } from '../dtos/pagination.dtos';
import {
  ArticleResponseDto,
  ArticleListResponseDto,
  ErrorResponseDto,
  SuccessResponseDto,
} from '../dtos/response.dtos';
import {
  CreateArticleRestPresenter,
  UpdateArticleRestPresenter,
  DeleteArticleRestPresenter,
  GetArticleRestPresenter,
  GetAllArticlesRestPresenter,
  PublishArticleRestPresenter,
} from '../presenters/article-rest.presenter';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';

@ApiTags('Articles')
@Controller('articles')
@UseGuards(RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ArticlesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly createArticlePresenter: CreateArticleRestPresenter,
    private readonly updateArticlePresenter: UpdateArticleRestPresenter,
    private readonly deleteArticlePresenter: DeleteArticleRestPresenter,
    private readonly getArticlePresenter: GetArticleRestPresenter,
    private readonly getAllArticlesPresenter: GetAllArticlesRestPresenter,
    private readonly publishArticlePresenter: PublishArticleRestPresenter,
  ) {}

  @Post()
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Create a new article',
    description: 'Creates a new article with the provided title, content, and author ID.',
  })
  @ApiResponse({
    status: 201,
    description: 'Article created successfully',
    type: ArticleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiBody({
    type: CreateArticleRequestDto,
    description: 'Article creation data',
  })
  async createArticle(
    @Body(ValidationPipe) createArticleDto: CreateArticleRequestDto,
    @CurrentUser() user: any,
    @Res() response: Response,
  ): Promise<void> {
    this.createArticlePresenter.setResponse(response);

    const command = new CreateArticleCommand(
      createArticleDto.title,
      createArticleDto.content,
      createArticleDto.authorId,
    );

    await this.commandBus.execute(command);
  }

  @Get()
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Get all articles with pagination',
    description: 'Retrieves a paginated list of articles with optional filtering and sorting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Articles retrieved successfully',
    type: ArticleListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
    type: ErrorResponseDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field to sort by',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
    example: 'DESC',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for title or content',
    example: 'clean architecture',
  })
  @ApiQuery({
    name: 'authorId',
    required: false,
    type: String,
    description: 'Filter by author ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'published',
    required: false,
    type: Boolean,
    description: 'Filter by publication status',
    example: true,
  })
  async getAllArticles(
    @Query(new ValidationPipe({ transform: true })) paginationDto: PaginationRequestDto,
    @Res() response: Response,
  ): Promise<void> {
    this.getAllArticlesPresenter.setResponse(response);

    const paginationOptions = {
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 10,
      sortBy: paginationDto.sortBy || 'createdAt',
      sortOrder: paginationDto.sortOrder || 'DESC' as const,
      search: paginationDto.search,
      authorId: paginationDto.authorId,
      published: paginationDto.published,
    };

    const query = new GetAllArticlesQuery(paginationOptions);

    try {
      await this.queryBus.execute(query);
    } catch (error) {
      if (error.message?.includes('Response object not set')) {
        response.status(500).json({
          message: 'Internal server error',
        });
      } else {
        throw error;
      }
    }
  }

  @Get(':id')
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Get article by ID',
    description: 'Retrieves a specific article by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Article unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Article retrieved successfully',
    type: ArticleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
    type: ErrorResponseDto,
  })
  async getArticle(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    this.getArticlePresenter.setResponse(response);

    const query = new GetArticleQuery(id);

    await this.queryBus.execute(query);
  }

  @Get('author/:authorId')
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Get articles by author',
    description: 'Retrieves all articles written by a specific author.',
  })
  @ApiParam({
    name: 'authorId',
    type: String,
    description: 'Author unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Articles retrieved successfully',
    type: ArticleListResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Author not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
    type: ErrorResponseDto,
  })
  async getArticlesByAuthor(
    @Param('authorId') authorId: string,
    @Res() response: Response,
  ): Promise<void> {
    this.getAllArticlesPresenter.setResponse(response);

    const query = new GetArticlesByAuthorQuery(authorId);

    await this.queryBus.execute(query);
  }

  @Put(':id')
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Update an article',
    description: 'Updates an existing article with new title and/or content.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Article unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateArticleRequestDto,
    description: 'Article update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Article updated successfully',
    type: ArticleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
    type: ErrorResponseDto,
  })
  async updateArticle(
    @Param('id') id: string,
    @Body(ValidationPipe) updateArticleDto: UpdateArticleRequestDto,
    @CurrentUser() user: any,
    @Res() response: Response,
  ): Promise<void> {
    this.updateArticlePresenter.setResponse(response);

    const command = new UpdateArticleCommand(
      id,
      updateArticleDto.title,
      updateArticleDto.content,
    );

    await this.commandBus.execute(command);
  }

  @Delete(':id')
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Delete an article',
    description: 'Permanently deletes an article from the system.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Article unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Article deleted successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
    type: ErrorResponseDto,
  })
  async deleteArticle(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() response: Response,
  ): Promise<void> {
    this.deleteArticlePresenter.setResponse(response);

    const command = new DeleteArticleCommand(id);

    await this.commandBus.execute(command);
  }

  @Post(':id/publish')
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Publish an article',
    description: 'Changes the status of an article to published, making it visible to readers.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Article unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: PublishArticleRequestDto,
    description: 'Optional publication data',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Article published successfully',
    type: ArticleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Article already published',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
    type: ErrorResponseDto,
  })
  async publishArticle(
    @Param('id') id: string,
    @Body() publishArticleDto: PublishArticleRequestDto,
    @CurrentUser() user: any,
    @Res() response: Response,
  ): Promise<void> {
    this.publishArticlePresenter.setResponse(response);

    const command = new PublishArticleCommand(id);

    await this.commandBus.execute(command);
  }

  @Post(':id/unpublish')
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Unpublish an article',
    description: 'Changes the status of an article to unpublished, hiding it from readers.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Article unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Article unpublished successfully',
    type: ArticleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Article already unpublished',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
    type: ErrorResponseDto,
  })
  async unpublishArticle(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() response: Response,
  ): Promise<void> {
    this.publishArticlePresenter.setResponse(response);

    const command = new UnpublishArticleCommand(id);

    await this.commandBus.execute(command);
  }
}
