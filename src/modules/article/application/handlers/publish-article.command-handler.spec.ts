import { Test, TestingModule } from '@nestjs/testing';
import { PublishArticleCommandHandler } from './publish-article.command-handler';
import { PublishArticleCommand } from '../commands';
import { PublishArticleOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';
import { Author } from '../../../author/domain/entities/author.entity';
import { FullName } from '../../../author/domain/value-objects/full-name.value-object';
import { Email } from '../../../author/domain/value-objects/email.value-object';
import { Article } from '../../domain/entities/article.entity';
import { ArticleTitle } from '../../domain/value-objects/article-title.value-object';
import { ArticleContent } from '../../domain/value-objects/article-content.value-object';
import { ArticleCacheInvalidationService } from '../services/article-cache-invalidation.service';

describe('PublishArticleCommandHandler', () => {
  let handler: PublishArticleCommandHandler;
  let articleRepository: jest.Mocked<ArticleRepository>;
  let outputPort: jest.Mocked<PublishArticleOutputPort>;
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
      presentValidationError: jest.fn(),
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
        PublishArticleCommandHandler,
        {
          provide: ArticleRepository,
          useValue: mockArticleRepository,
        },
        {
          provide: PublishArticleOutputPort,
          useValue: mockOutputPort,
        },
        {
          provide: ArticleCacheInvalidationService,
          useValue: mockCacheInvalidationService,
        },
      ],
    }).compile();

    handler = module.get<PublishArticleCommandHandler>(PublishArticleCommandHandler);
    articleRepository = module.get(ArticleRepository);
    outputPort = module.get(PublishArticleOutputPort);
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

  it('should publish article successfully', async () => {
    // Arrange
    const command = new PublishArticleCommand(mockArticle.id);
    articleRepository.findById.mockResolvedValue(mockArticle);

    const publishedArticle = mockArticle.publish();
    articleRepository.save.mockResolvedValue(publishedArticle);

    // Act
    await handler.execute(command);

    // Assert
    expect(articleRepository.findById).toHaveBeenCalledWith(mockArticle.id);
    expect(articleRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        isPublished: true,
        publishedAt: expect.any(Date),
      }),
    );
    expect(outputPort.presentSuccess).toHaveBeenCalledWith(publishedArticle);
  });

  it('should present not found error when article does not exist', async () => {
    // Arrange
    const command = new PublishArticleCommand('non-existent-id');
    articleRepository.findById.mockResolvedValue(null);

    // Act
    await handler.execute(command);

    // Assert
    expect(articleRepository.findById).toHaveBeenCalledWith('non-existent-id');
    expect(outputPort.presentNotFoundError).toHaveBeenCalledWith('Article not found');
    expect(articleRepository.save).not.toHaveBeenCalled();
  });

  it('should present validation error when article is already published', async () => {
    // Arrange
    const publishedArticle = mockArticle.publish();
    const command = new PublishArticleCommand(publishedArticle.id);
    articleRepository.findById.mockResolvedValue(publishedArticle);

    // Act
    await handler.execute(command);

    // Assert
    expect(outputPort.presentValidationError).toHaveBeenCalledWith([
      'Article is already published',
    ]);
    expect(articleRepository.save).not.toHaveBeenCalled();
  });

  it('should present server error when repository throws', async () => {
    // Arrange
    const command = new PublishArticleCommand(mockArticle.id);
    articleRepository.findById.mockRejectedValue(new Error('Database error'));

    // Act
    await handler.execute(command);

    // Assert
    expect(outputPort.presentServerError).toHaveBeenCalledWith(
      'Failed to publish article: Database error',
    );
  });
});
