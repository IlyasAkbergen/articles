import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { ArticlesController } from './articles.controller';
import {
  CreateArticleRestPresenter,
  UpdateArticleRestPresenter,
  DeleteArticleRestPresenter,
  GetArticleRestPresenter,
  GetAllArticlesRestPresenter,
  PublishArticleRestPresenter,
} from '../presenters/article-rest.presenter';
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

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;
  let createPresenter: jest.Mocked<CreateArticleRestPresenter>;
  let updatePresenter: jest.Mocked<UpdateArticleRestPresenter>;
  let deletePresenter: jest.Mocked<DeleteArticleRestPresenter>;
  let getPresenter: jest.Mocked<GetArticleRestPresenter>;
  let getAllPresenter: jest.Mocked<GetAllArticlesRestPresenter>;
  let publishPresenter: jest.Mocked<PublishArticleRestPresenter>;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    const mockCommandBus = {
      execute: jest.fn(),
    };

    const mockQueryBus = {
      execute: jest.fn(),
    };

    const mockCreatePresenter = {
      setResponse: jest.fn(),
    };

    const mockUpdatePresenter = {
      setResponse: jest.fn(),
    };

    const mockDeletePresenter = {
      setResponse: jest.fn(),
    };

    const mockGetPresenter = {
      setResponse: jest.fn(),
    };

    const mockGetAllPresenter = {
      setResponse: jest.fn(),
    };

    const mockPublishPresenter = {
      setResponse: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
        {
          provide: CreateArticleRestPresenter,
          useValue: mockCreatePresenter,
        },
        {
          provide: UpdateArticleRestPresenter,
          useValue: mockUpdatePresenter,
        },
        {
          provide: DeleteArticleRestPresenter,
          useValue: mockDeletePresenter,
        },
        {
          provide: GetArticleRestPresenter,
          useValue: mockGetPresenter,
        },
        {
          provide: GetAllArticlesRestPresenter,
          useValue: mockGetAllPresenter,
        },
        {
          provide: PublishArticleRestPresenter,
          useValue: mockPublishPresenter,
        },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
    createPresenter = module.get(CreateArticleRestPresenter);
    updatePresenter = module.get(UpdateArticleRestPresenter);
    deletePresenter = module.get(DeleteArticleRestPresenter);
    getPresenter = module.get(GetArticleRestPresenter);
    getAllPresenter = module.get(GetAllArticlesRestPresenter);
    publishPresenter = module.get(PublishArticleRestPresenter);

    mockResponse = {};
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createArticle', () => {
    it('should execute CreateArticleCommand with correct parameters', async () => {
      // Arrange
      const dto: CreateArticleRequestDto = {
        title: 'Test Article',
        content: 'Test content',
        authorId: 'author-id',
      };

      // Act
      await controller.createArticle(dto, mockResponse as Response);

      // Assert
      expect(createPresenter.setResponse).toHaveBeenCalledWith(mockResponse);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateArticleCommand(dto.title, dto.content, dto.authorId),
      );
    });
  });

  describe('getAllArticles', () => {
    it('should execute GetAllArticlesQuery', async () => {
      // Act
      await controller.getAllArticles(mockResponse as Response);

      // Assert
      expect(getAllPresenter.setResponse).toHaveBeenCalledWith(mockResponse);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetAllArticlesQuery());
    });
  });

  describe('getArticle', () => {
    it('should execute GetArticleQuery with correct id', async () => {
      // Arrange
      const articleId = 'article-id';

      // Act
      await controller.getArticle(articleId, mockResponse as Response);

      // Assert
      expect(getPresenter.setResponse).toHaveBeenCalledWith(mockResponse);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetArticleQuery(articleId));
    });
  });

  describe('getArticlesByAuthor', () => {
    it('should execute GetArticlesByAuthorQuery with correct authorId', async () => {
      // Arrange
      const authorId = 'author-id';

      // Act
      await controller.getArticlesByAuthor(authorId, mockResponse as Response);

      // Assert
      expect(getAllPresenter.setResponse).toHaveBeenCalledWith(mockResponse);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetArticlesByAuthorQuery(authorId),
      );
    });
  });

  describe('updateArticle', () => {
    it('should execute UpdateArticleCommand with correct parameters', async () => {
      // Arrange
      const articleId = 'article-id';
      const dto: UpdateArticleRequestDto = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      // Act
      await controller.updateArticle(articleId, dto, mockResponse as Response);

      // Assert
      expect(updatePresenter.setResponse).toHaveBeenCalledWith(mockResponse);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdateArticleCommand(articleId, dto.title, dto.content),
      );
    });
  });

  describe('deleteArticle', () => {
    it('should execute DeleteArticleCommand with correct id', async () => {
      // Arrange
      const articleId = 'article-id';

      // Act
      await controller.deleteArticle(articleId, mockResponse as Response);

      // Assert
      expect(deletePresenter.setResponse).toHaveBeenCalledWith(mockResponse);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new DeleteArticleCommand(articleId),
      );
    });
  });

  describe('publishArticle', () => {
    it('should execute PublishArticleCommand with correct id', async () => {
      // Arrange
      const articleId = 'article-id';
      const dto: PublishArticleRequestDto = {};

      // Act
      await controller.publishArticle(articleId, dto, mockResponse as Response);

      // Assert
      expect(publishPresenter.setResponse).toHaveBeenCalledWith(mockResponse);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new PublishArticleCommand(articleId),
      );
    });
  });

  describe('unpublishArticle', () => {
    it('should execute UnpublishArticleCommand with correct id', async () => {
      // Arrange
      const articleId = 'article-id';

      // Act
      await controller.unpublishArticle(articleId, mockResponse as Response);

      // Assert
      expect(publishPresenter.setResponse).toHaveBeenCalledWith(mockResponse);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new UnpublishArticleCommand(articleId),
      );
    });
  });
});
