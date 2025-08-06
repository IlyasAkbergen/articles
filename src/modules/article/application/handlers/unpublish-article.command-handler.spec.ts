import { Test, TestingModule } from '@nestjs/testing';
import { UnpublishArticleCommandHandler } from './unpublish-article.command-handler';
import { UnpublishArticleCommand } from '../commands';
import { PublishArticleOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';
import { Author } from '../../../author/domain/entities/author.entity';
import { FullName } from '../../../author/domain/value-objects/full-name.value-object';
import { Email } from '../../../author/domain/value-objects/email.value-object';
import { Article } from '../../domain/entities/article.entity';
import { ArticleTitle } from '../../domain/value-objects/article-title.value-object';
import { ArticleContent } from '../../domain/value-objects/article-content.value-object';

describe('UnpublishArticleCommandHandler', () => {
  let handler: UnpublishArticleCommandHandler;
  let articleRepository: jest.Mocked<ArticleRepository>;
  let outputPort: jest.Mocked<PublishArticleOutputPort>;
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnpublishArticleCommandHandler,
        {
          provide: ArticleRepository,
          useValue: mockArticleRepository,
        },
        {
          provide: PublishArticleOutputPort,
          useValue: mockOutputPort,
        },
      ],
    }).compile();

    handler = module.get<UnpublishArticleCommandHandler>(UnpublishArticleCommandHandler);
    articleRepository = module.get(ArticleRepository);
    outputPort = module.get(PublishArticleOutputPort);

    // Create mock data
    mockAuthor = Author.create(
      new FullName({ firstName: 'Iliyas', lastName: 'Akbergen' }),
      new Email('iliyas.akbergen@gmail.com'),
    );

    mockArticle = Article.create(
      new ArticleTitle({ value: 'Test Article' }),
      new ArticleContent({ value: 'Test content' }),
      mockAuthor,
    ).publish(); // Start with published article
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should unpublish article successfully', async () => {
    // Arrange
    const command = new UnpublishArticleCommand(mockArticle.id);
    articleRepository.findById.mockResolvedValue(mockArticle);

    const unpublishedArticle = mockArticle.unpublish();
    articleRepository.save.mockResolvedValue(unpublishedArticle);

    // Act
    await handler.execute(command);

    // Assert
    expect(articleRepository.findById).toHaveBeenCalledWith(mockArticle.id);
    expect(articleRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        isPublished: false,
        publishedAt: null,
      }),
    );
    expect(outputPort.presentSuccess).toHaveBeenCalledWith(unpublishedArticle);
  });

  it('should present not found error when article does not exist', async () => {
    // Arrange
    const command = new UnpublishArticleCommand('non-existent-id');
    articleRepository.findById.mockResolvedValue(null);

    // Act
    await handler.execute(command);

    // Assert
    expect(articleRepository.findById).toHaveBeenCalledWith('non-existent-id');
    expect(outputPort.presentNotFoundError).toHaveBeenCalledWith('Article not found');
    expect(articleRepository.save).not.toHaveBeenCalled();
  });

  it('should present validation error when article is already unpublished', async () => {
    // Arrange
    const unpublishedArticle = mockArticle.unpublish();
    const command = new UnpublishArticleCommand(unpublishedArticle.id);
    articleRepository.findById.mockResolvedValue(unpublishedArticle);

    // Act
    await handler.execute(command);

    // Assert
    expect(outputPort.presentValidationError).toHaveBeenCalledWith([
      'Article is already unpublished',
    ]);
    expect(articleRepository.save).not.toHaveBeenCalled();
  });

  it('should present server error when repository throws', async () => {
    // Arrange
    const command = new UnpublishArticleCommand(mockArticle.id);
    articleRepository.findById.mockRejectedValue(new Error('Database error'));

    // Act
    await handler.execute(command);

    // Assert
    expect(outputPort.presentServerError).toHaveBeenCalledWith(
      'Failed to unpublish article: Database error',
    );
  });
});
