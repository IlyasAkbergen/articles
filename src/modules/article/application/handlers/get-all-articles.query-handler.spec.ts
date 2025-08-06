import { Test, TestingModule } from '@nestjs/testing';
import { GetAllArticlesQueryHandler } from './get-all-articles.query-handler';
import { GetAllArticlesQuery } from '../queries';
import { GetAllArticlesOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';
import { Author } from '../../../author/domain/entities/author.entity';
import { FullName } from '../../../author/domain/value-objects/full-name.value-object';
import { Email } from '../../../author/domain/value-objects/email.value-object';
import { Article } from '../../domain/entities/article.entity';
import { ArticleTitle } from '../../domain/value-objects/article-title.value-object';
import { ArticleContent } from '../../domain/value-objects/article-content.value-object';

describe('GetAllArticlesQueryHandler', () => {
  let handler: GetAllArticlesQueryHandler;
  let articleRepository: jest.Mocked<ArticleRepository>;
  let outputPort: jest.Mocked<GetAllArticlesOutputPort>;
  let mockAuthor: Author;
  let mockArticles: Article[];

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
      presentServerError: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllArticlesQueryHandler,
        {
          provide: ArticleRepository,
          useValue: mockArticleRepository,
        },
        {
          provide: GetAllArticlesOutputPort,
          useValue: mockOutputPort,
        },
      ],
    }).compile();

    handler = module.get<GetAllArticlesQueryHandler>(GetAllArticlesQueryHandler);
    articleRepository = module.get(ArticleRepository);
    outputPort = module.get(GetAllArticlesOutputPort);

    // Create mock data
    mockAuthor = Author.create(
      new FullName({ firstName: 'Iliyas', lastName: 'Akbergen' }),
      new Email('iliyas.akbergen@gmail.com'),
    );

    mockArticles = [
      Article.create(
        new ArticleTitle({ value: 'First Article' }),
        new ArticleContent({ value: 'First article content' }),
        mockAuthor,
      ),
      Article.create(
        new ArticleTitle({ value: 'Second Article' }),
        new ArticleContent({ value: 'Second article content' }),
        mockAuthor,
      ),
    ];
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should get all articles successfully', async () => {
    // Arrange
    const query = new GetAllArticlesQuery();
    articleRepository.findAll.mockResolvedValue(mockArticles);

    // Act
    await handler.execute(query);

    // Assert
    expect(articleRepository.findAll).toHaveBeenCalled();
    expect(outputPort.presentSuccess).toHaveBeenCalledWith(mockArticles);
  });

  it('should get empty array when no articles exist', async () => {
    // Arrange
    const query = new GetAllArticlesQuery();
    articleRepository.findAll.mockResolvedValue([]);

    // Act
    await handler.execute(query);

    // Assert
    expect(articleRepository.findAll).toHaveBeenCalled();
    expect(outputPort.presentSuccess).toHaveBeenCalledWith([]);
  });

  it('should present server error when repository throws', async () => {
    // Arrange
    const query = new GetAllArticlesQuery();
    articleRepository.findAll.mockRejectedValue(new Error('Database error'));

    // Act
    await handler.execute(query);

    // Assert
    expect(outputPort.presentServerError).toHaveBeenCalledWith(
      'Failed to get articles: Database error',
    );
  });
});
