import { Test, TestingModule } from '@nestjs/testing';
import { GetArticleQueryHandler } from './get-article.query-handler';
import { GetArticleQuery } from '../queries';
import { GetArticleOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';
import { Author } from '../../../author/domain/entities/author.entity';
import { FullName } from '../../../author/domain/value-objects/full-name.value-object';
import { Email } from '../../../author/domain/value-objects/email.value-object';
import { Article } from '../../domain/entities/article.entity';
import { ArticleTitle } from '../../domain/value-objects/article-title.value-object';
import { ArticleContent } from '../../domain/value-objects/article-content.value-object';

describe('GetArticleQueryHandler', () => {
  let handler: GetArticleQueryHandler;
  let articleRepository: jest.Mocked<ArticleRepository>;
  let outputPort: jest.Mocked<GetArticleOutputPort>;
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetArticleQueryHandler,
        {
          provide: ArticleRepository,
          useValue: mockArticleRepository,
        },
        {
          provide: GetArticleOutputPort,
          useValue: mockOutputPort,
        },
      ],
    }).compile();

    handler = module.get<GetArticleQueryHandler>(GetArticleQueryHandler);
    articleRepository = module.get(ArticleRepository);
    outputPort = module.get(GetArticleOutputPort);

    // Create mock data
    mockAuthor = Author.create(
      new FullName({ firstName: 'Iliyas', lastName: 'Akbergen' }),
      new Email('iliyas.akbergen@gmail.com'),
    );

    mockArticle = Article.create(
      new ArticleTitle({ value: 'Test Article Title' }),
      new ArticleContent({ value: 'This is test article content' }),
      mockAuthor,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should get article successfully', async () => {
    // Arrange
    const query = new GetArticleQuery(mockArticle.id);
    articleRepository.findById.mockResolvedValue(mockArticle);

    // Act
    await handler.execute(query);

    // Assert
    expect(articleRepository.findById).toHaveBeenCalledWith(mockArticle.id);
    expect(outputPort.presentSuccess).toHaveBeenCalledWith(mockArticle);
  });

  it('should present not found error when article does not exist', async () => {
    // Arrange
    const query = new GetArticleQuery('non-existent-id');
    articleRepository.findById.mockResolvedValue(null);

    // Act
    await handler.execute(query);

    // Assert
    expect(articleRepository.findById).toHaveBeenCalledWith('non-existent-id');
    expect(outputPort.presentNotFoundError).toHaveBeenCalledWith('Article not found');
  });

  it('should present server error when repository throws', async () => {
    // Arrange
    const query = new GetArticleQuery(mockArticle.id);
    articleRepository.findById.mockRejectedValue(new Error('Database error'));

    // Act
    await handler.execute(query);

    // Assert
    expect(outputPort.presentServerError).toHaveBeenCalledWith(
      'Failed to get article: Database error',
    );
  });
});
