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

@Controller('articles')
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
  async createArticle(
    @Body(ValidationPipe) createArticleDto: CreateArticleRequestDto,
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
  async getArticle(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    this.getArticlePresenter.setResponse(response);

    const query = new GetArticleQuery(id);

    await this.queryBus.execute(query);
  }

  @Get('author/:authorId')
  async getArticlesByAuthor(
    @Param('authorId') authorId: string,
    @Res() response: Response,
  ): Promise<void> {
    this.getAllArticlesPresenter.setResponse(response);

    const query = new GetArticlesByAuthorQuery(authorId);

    await this.queryBus.execute(query);
  }

  @Put(':id')
  async updateArticle(
    @Param('id') id: string,
    @Body(ValidationPipe) updateArticleDto: UpdateArticleRequestDto,
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
  async deleteArticle(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    this.deleteArticlePresenter.setResponse(response);

    const command = new DeleteArticleCommand(id);

    await this.commandBus.execute(command);
  }

  @Post(':id/publish')
  async publishArticle(
    @Param('id') id: string,
    @Body() publishArticleDto: PublishArticleRequestDto,
    @Res() response: Response,
  ): Promise<void> {
    this.publishArticlePresenter.setResponse(response);

    const command = new PublishArticleCommand(id);

    await this.commandBus.execute(command);
  }

  @Post(':id/unpublish')
  async unpublishArticle(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    this.publishArticlePresenter.setResponse(response);

    const command = new UnpublishArticleCommand(id);

    await this.commandBus.execute(command);
  }
}
