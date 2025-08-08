import { Test, TestingModule } from '@nestjs/testing';
import { GetAllArticlesQueryHandler } from './get-all-articles.query-handler';
import { GetAllArticlesQuery } from '../queries';
import { GetAllArticlesOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';
import { CacheService } from '../services/cache.service';
import { Author } from '../../../author/domain/entities/author.entity';
import { FullName } from '../../../author/domain/value-objects/full-name.value-object';
import { Email } from '../../../author/domain/value-objects/email.value-object';
import { Article } from '../../domain/entities/article.entity';
import { ArticleTitle } from '../../domain/value-objects/article-title.value-object';
import { ArticleContent } from '../../domain/value-objects/article-content.value-object';
import { PaginationResult } from '../../domain/interfaces/pagination.interface';

describe('GetAllArticlesQueryHandler', () => {
  let handler: GetAllArticlesQueryHandler;
  let articleRepository: jest.Mocked<ArticleRepository>;
  let outputPort: jest.Mocked<GetAllArticlesOutputPort>;
  let cacheService: jest.Mocked<CacheService>;
  let mockAuthor: Author;
  let mockArticles: Article[];

  beforeEach(async () => {
    const mockArticleRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findByAuthorId: jest.fn(),
      delete: jest.fn(),
    };

    const mockOutputPort = {
      presentSuccess: jest.fn(),
      presentSuccessPaginated: jest.fn(),
      presentServerError: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      delPattern: jest.fn(),
      generateKey: jest.fn(),
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
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    handler = module.get<GetAllArticlesQueryHandler>(GetAllArticlesQueryHandler);
    articleRepository = module.get(ArticleRepository);
    outputPort = module.get(GetAllArticlesOutputPort);
    cacheService = module.get(CacheService);

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

  it('should get all articles successfully without pagination (legacy)', async () => {
    // Arrange
    const query = new GetAllArticlesQuery();
    articleRepository.findAll.mockResolvedValue(mockArticles);

    // Act
    await handler.execute(query);

    // Assert
    expect(articleRepository.findAll).toHaveBeenCalled();
    expect(outputPort.presentSuccess).toHaveBeenCalledWith(mockArticles);
    expect(cacheService.get).not.toHaveBeenCalled();
  });

  it('should get articles with pagination from cache when available', async () => {
    // Arrange
    const paginationOptions = { page: 1, limit: 10 };
    const query = new GetAllArticlesQuery(paginationOptions);
    const cacheKey = 'articles:limit:10|page:1';
    const cachedResult: PaginationResult<Article> = {
      data: mockArticles,
      total: 2,
      page: 1,
      limit: 10,
    };

    cacheService.generateKey.mockReturnValue(cacheKey);
    cacheService.get.mockResolvedValue(cachedResult);

    // Act
    await handler.execute(query);

    // Assert
    expect(cacheService.generateKey).toHaveBeenCalledWith('articles', paginationOptions);
    expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
    expect(outputPort.presentSuccessPaginated).toHaveBeenCalledWith(cachedResult);
    expect(articleRepository.findAllPaginated).not.toHaveBeenCalled();
  });

  it('should get articles with pagination from database and cache result when cache miss', async () => {
    // Arrange
    const paginationOptions = { page: 1, limit: 10 };
    const query = new GetAllArticlesQuery(paginationOptions);
    const cacheKey = 'articles:limit:10|page:1';
    const dbResult: PaginationResult<Article> = {
      data: mockArticles,
      total: 2,
      page: 1,
      limit: 10,
    };

    cacheService.generateKey.mockReturnValue(cacheKey);
    cacheService.get.mockResolvedValue(null); // Cache miss
    articleRepository.findAllPaginated.mockResolvedValue(dbResult);

    // Act
    await handler.execute(query);

    // Assert
    expect(cacheService.generateKey).toHaveBeenCalledWith('articles', paginationOptions);
    expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
    expect(articleRepository.findAllPaginated).toHaveBeenCalledWith(paginationOptions);
    expect(cacheService.set).toHaveBeenCalledWith(cacheKey, dbResult, { ttl: 300 });
    expect(outputPort.presentSuccessPaginated).toHaveBeenCalledWith(dbResult);
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

  it('should present server error when paginated repository throws', async () => {
    // Arrange
    const paginationOptions = { page: 1, limit: 10 };
    const query = new GetAllArticlesQuery(paginationOptions);
    const cacheKey = 'articles:limit:10|page:1';

    cacheService.generateKey.mockReturnValue(cacheKey);
    cacheService.get.mockResolvedValue(null);
    articleRepository.findAllPaginated.mockRejectedValue(new Error('Database error'));

    // Act
    await handler.execute(query);

    // Assert
    expect(outputPort.presentServerError).toHaveBeenCalledWith(
      'Failed to get articles: Database error',
    );
  });
});
