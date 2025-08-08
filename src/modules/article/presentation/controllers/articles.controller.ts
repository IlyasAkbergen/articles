import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ValidationPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
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

@Controller('articles')
@UseGuards(RolesGuard)
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
  async getAllArticles(@Res() response: Response): Promise<void> {
    this.getAllArticlesPresenter.setResponse(response);

    const query = new GetAllArticlesQuery();

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
