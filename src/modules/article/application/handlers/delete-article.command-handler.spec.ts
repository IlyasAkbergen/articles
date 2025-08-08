import { Test, TestingModule } from '@nestjs/testing';
import { DeleteArticleCommandHandler } from './delete-article.command-handler';
import { DeleteArticleCommand } from '../commands';
import { DeleteArticleOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';
import { Author } from '../../../author/domain/entities/author.entity';
import { FullName } from '../../../author/domain/value-objects/full-name.value-object';
import { Email } from '../../../author/domain/value-objects/email.value-object';
import { Article } from '../../domain/entities/article.entity';
import { ArticleTitle } from '../../domain/value-objects/article-title.value-object';
import { ArticleContent } from '../../domain/value-objects/article-content.value-object';
import { ArticleCacheInvalidationService } from '../services/article-cache-invalidation.service';

describe('DeleteArticleCommandHandler', () => {
  let handler: DeleteArticleCommandHandler;
  let articleRepository: jest.Mocked<ArticleRepository>;
  let outputPort: jest.Mocked<DeleteArticleOutputPort>;
  let cacheInvalidationService: jest.Mocked<ArticleCacheInvalidationService>;
  let mockAuthor: Author;
  let mockArticle: Article;

  beforeEach(async () => {
    const mockArticleRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByAuthorId: jest.fn(),
      delete: jest.fn(),
    };

    const mockOutputPort = {
      presentSuccess: jest.fn(),
      presentNotFoundError: jest.fn(),
      presentServerError: jest.fn(),
    };

    const mockCacheInvalidationService = {
      invalidateAllArticlesCaches: jest.fn(),
      invalidateArticleCache: jest.fn(),
      invalidateAuthorArticlesCache: jest.fn(),
      invalidateOnArticleUpdate: jest.fn(),
      invalidateOnArticleCreate: jest.fn(),
      invalidateOnArticleDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteArticleCommandHandler,
        {
          provide: ArticleRepository,
          useValue: mockArticleRepository,
        },
        {
          provide: DeleteArticleOutputPort,
          useValue: mockOutputPort,
        },
        {
          provide: ArticleCacheInvalidationService,
          useValue: mockCacheInvalidationService,
        },
      ],
    }).compile();

    handler = module.get<DeleteArticleCommandHandler>(DeleteArticleCommandHandler);
    articleRepository = module.get(ArticleRepository);
    outputPort = module.get(DeleteArticleOutputPort);
    cacheInvalidationService = module.get(ArticleCacheInvalidationService);

    // Create mock data
    mockAuthor = Author.create(
      new FullName({ firstName: 'Iliyas', lastName: 'Akbergen' }),
      new Email('iliyas.akbergen@gmail.com'),
    );

    mockArticle = Article.create(
      new ArticleTitle({ value: 'Test Article' }),
      new ArticleContent({ value: 'Test content' }),
      mockAuthor,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should delete article successfully', async () => {
    // Arrange
    const command = new DeleteArticleCommand(mockArticle.id);
    articleRepository.findById.mockResolvedValue(mockArticle);
    articleRepository.delete.mockResolvedValue();

    // Act
    await handler.execute(command);

    // Assert
    expect(articleRepository.findById).toHaveBeenCalledWith(mockArticle.id);
    expect(articleRepository.delete).toHaveBeenCalledWith(mockArticle.id);
    expect(outputPort.presentSuccess).toHaveBeenCalled();
  });

  it('should present not found error when article does not exist', async () => {
    // Arrange
    const command = new DeleteArticleCommand('non-existent-id');
    articleRepository.findById.mockResolvedValue(null);

    // Act
    await handler.execute(command);

    // Assert
    expect(articleRepository.findById).toHaveBeenCalledWith('non-existent-id');
    expect(outputPort.presentNotFoundError).toHaveBeenCalledWith('Article not found');
    expect(articleRepository.delete).not.toHaveBeenCalled();
  });

  it('should present server error when repository throws', async () => {
    // Arrange
    const command = new DeleteArticleCommand(mockArticle.id);
    articleRepository.findById.mockRejectedValue(new Error('Database error'));

    // Act
    await handler.execute(command);

    // Assert
    expect(outputPort.presentServerError).toHaveBeenCalledWith(
      'Failed to delete article: Database error',
    );
  });
});
