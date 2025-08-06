import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ArticleEntity } from '../src/modules/article/infrastructure/persistence/article.entity';
import { AuthorEntity } from '../src/modules/author/infrastructure/persistence/author.entity';

describe('Articles API (e2e)', () => {
  let app: INestApplication;
  let mockArticleRepository: any;
  let mockAuthorRepository: any;

  const mockAuthor = {
    id: 'author-id-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockArticle = {
    id: 'article-id-123',
    title: 'Test Article',
    content: 'This is test content',
    authorId: 'author-id-123',
    author: mockAuthor,
    isPublished: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: null,
  };

  beforeEach(async () => {
    // Mock repositories
    mockArticleRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };

    mockAuthorRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(ArticleEntity))
      .useValue(mockArticleRepository)
      .overrideProvider(getRepositoryToken(AuthorEntity))
      .useValue(mockAuthorRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/articles (POST)', () => {
    it('should create article successfully', async () => {
      // Arrange
      mockAuthorRepository.findOne.mockResolvedValue(mockAuthor);
      mockArticleRepository.save.mockResolvedValue(mockArticle);

      const createArticleDto = {
        title: 'Test Article',
        content: 'This is test content',
        authorId: 'author-id-123',
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/articles')
        .send(createArticleDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: createArticleDto.title,
        content: createArticleDto.content,
        authorId: createArticleDto.authorId,
        isPublished: false,
      });
    });

    it('should return validation error for empty title', async () => {
      // Arrange
      const createArticleDto = {
        title: '',
        content: 'This is test content',
        authorId: 'author-id-123',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/articles')
        .send(createArticleDto)
        .expect(400);
    });

    it('should return not found error for non-existent author', async () => {
      // Arrange
      mockAuthorRepository.findOne.mockResolvedValue(null);

      const createArticleDto = {
        title: 'Test Article',
        content: 'This is test content',
        authorId: 'non-existent-author',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/articles')
        .send(createArticleDto)
        .expect(404);
    });
  });

  describe('/articles (GET)', () => {
    it('should get all articles', async () => {
      // Arrange
      mockArticleRepository.find.mockResolvedValue([mockArticle]);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/articles')
        .expect(200);

      expect(response.body).toMatchObject({
        articles: expect.any(Array),
        total: 1,
      });
      expect(response.body.articles[0]).toMatchObject({
        id: mockArticle.id,
        title: mockArticle.title,
        content: mockArticle.content,
      });
    });
  });

  describe('/articles/:id (GET)', () => {
    it('should get article by id', async () => {
      // Arrange
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/articles/${mockArticle.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: mockArticle.id,
        title: mockArticle.title,
        content: mockArticle.content,
      });
    });

    it('should return 404 for non-existent article', async () => {
      // Arrange
      mockArticleRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await request(app.getHttpServer())
        .get('/articles/non-existent-id')
        .expect(404);
    });
  });

  describe('/articles/:id (PUT)', () => {
    it('should update article successfully', async () => {
      // Arrange
      const updatedArticle = { ...mockArticle, title: 'Updated Title' };
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(updatedArticle);

      const updateArticleDto = {
        title: 'Updated Title',
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .put(`/articles/${mockArticle.id}`)
        .send(updateArticleDto)
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
    });
  });

  describe('/articles/:id (DELETE)', () => {
    it('should delete article successfully', async () => {
      // Arrange
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockArticleRepository.delete.mockResolvedValue({ affected: 1 });

      // Act & Assert
      await request(app.getHttpServer())
        .delete(`/articles/${mockArticle.id}`)
        .expect(200);
    });
  });

  describe('/articles/:id/publish (POST)', () => {
    it('should publish article successfully', async () => {
      // Arrange
      const publishedArticle = {
        ...mockArticle,
        isPublished: true,
        publishedAt: new Date(),
      };
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(publishedArticle);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post(`/articles/${mockArticle.id}/publish`)
        .send({})
        .expect(200);

      expect(response.body.isPublished).toBe(true);
      expect(response.body.publishedAt).toBeDefined();
    });
  });
});
