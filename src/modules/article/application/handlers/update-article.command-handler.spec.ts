import { Test, TestingModule } from '@nestjs/testing';
import { UpdateArticleCommandHandler } from './update-article.command-handler';
import { UpdateArticleCommand } from '../commands';
import { UpdateArticleOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';
import { Author } from '../../../author/domain/entities/author.entity';
import { FullName } from '../../../author/domain/value-objects/full-name.value-object';
import { Email } from '../../../author/domain/value-objects/email.value-object';
import { Article } from '../../domain/entities/article.entity';
import { ArticleTitle } from '../../domain/value-objects/article-title.value-object';
import { ArticleContent } from '../../domain/value-objects/article-content.value-object';

describe('UpdateArticleCommandHandler', () => {
  let handler: UpdateArticleCommandHandler;
  let articleRepository: jest.Mocked<ArticleRepository>;
  let outputPort: jest.Mocked<UpdateArticleOutputPort>;
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
        UpdateArticleCommandHandler,
        {
          provide: ArticleRepository,
          useValue: mockArticleRepository,
        },
        {
          provide: UpdateArticleOutputPort,
          useValue: mockOutputPort,
        },
      ],
    }).compile();

    handler = module.get<UpdateArticleCommandHandler>(UpdateArticleCommandHandler);
    articleRepository = module.get(ArticleRepository);
    outputPort = module.get(UpdateArticleOutputPort);

    // Create mock data
    mockAuthor = Author.create(
      new FullName({ firstName: 'Iliyas', lastName: 'Akbergen' }),
      new Email('iliyas.akbergen@gmail.com'),
    );

    mockArticle = Article.create(
      new ArticleTitle({ value: 'Original Title' }),
      new ArticleContent({ value: 'Original content' }),
      mockAuthor,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should update article title successfully', async () => {
    // Arrange
    const command = new UpdateArticleCommand(mockArticle.id, 'Updated Title');
    articleRepository.findById.mockResolvedValue(mockArticle);

    const updatedArticle = mockArticle.updateTitle(
      new ArticleTitle({ value: 'Updated Title' }),
    );
    articleRepository.save.mockResolvedValue(updatedArticle);

    // Act
    await handler.execute(command);

    // Assert
    expect(articleRepository.findById).toHaveBeenCalledWith(mockArticle.id);
    expect(articleRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.objectContaining({ value: 'Updated Title' }),
      }),
    );
    expect(outputPort.presentSuccess).toHaveBeenCalledWith(updatedArticle);
  });

  it('should update article content successfully', async () => {
    // Arrange
    const command = new UpdateArticleCommand(
      mockArticle.id,
      undefined,
      'Updated content',
    );
    articleRepository.findById.mockResolvedValue(mockArticle);

    const updatedArticle = mockArticle.updateContent(
      new ArticleContent({ value: 'Updated content' }),
    );
    articleRepository.save.mockResolvedValue(updatedArticle);

    // Act
    await handler.execute(command);

    // Assert
    expect(articleRepository.findById).toHaveBeenCalledWith(mockArticle.id);
    expect(articleRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ value: 'Updated content' }),
      }),
    );
    expect(outputPort.presentSuccess).toHaveBeenCalledWith(updatedArticle);
  });

  it('should update both title and content successfully', async () => {
    // Arrange
    const command = new UpdateArticleCommand(
      mockArticle.id,
      'Updated Title',
      'Updated content',
    );
    articleRepository.findById.mockResolvedValue(mockArticle);

    let updatedArticle = mockArticle.updateTitle(
      new ArticleTitle({ value: 'Updated Title' }),
    );
    updatedArticle = updatedArticle.updateContent(
      new ArticleContent({ value: 'Updated content' }),
    );
    articleRepository.save.mockResolvedValue(updatedArticle);

    // Act
    await handler.execute(command);

    // Assert
    expect(articleRepository.findById).toHaveBeenCalledWith(mockArticle.id);
    expect(articleRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.objectContaining({ value: 'Updated Title' }),
        content: expect.objectContaining({ value: 'Updated content' }),
      }),
    );
    expect(outputPort.presentSuccess).toHaveBeenCalledWith(updatedArticle);
  });

  it('should present not found error when article does not exist', async () => {
    // Arrange
    const command = new UpdateArticleCommand('non-existent-id', 'Updated Title');
    articleRepository.findById.mockResolvedValue(null);

    // Act
    await handler.execute(command);

    // Assert
    expect(articleRepository.findById).toHaveBeenCalledWith('non-existent-id');
    expect(outputPort.presentNotFoundError).toHaveBeenCalledWith('Article not found');
    expect(articleRepository.save).not.toHaveBeenCalled();
  });

  it('should present validation error for empty title', async () => {
    // Arrange
    const command = new UpdateArticleCommand(mockArticle.id, '');
    articleRepository.findById.mockResolvedValue(mockArticle);

    // Act
    await handler.execute(command);

    // Assert
    expect(outputPort.presentValidationError).toHaveBeenCalledWith([
      'Title cannot be empty',
    ]);
    expect(articleRepository.save).not.toHaveBeenCalled();
  });

  it('should present validation error for empty content', async () => {
    // Arrange
    const command = new UpdateArticleCommand(mockArticle.id, undefined, '');
    articleRepository.findById.mockResolvedValue(mockArticle);

    // Act
    await handler.execute(command);

    // Assert
    expect(outputPort.presentValidationError).toHaveBeenCalledWith([
      'Content cannot be empty',
    ]);
    expect(articleRepository.save).not.toHaveBeenCalled();
  });

  it('should present validation error when no fields to update', async () => {
    // Arrange
    const command = new UpdateArticleCommand(mockArticle.id);
    articleRepository.findById.mockResolvedValue(mockArticle);

    // Act
    await handler.execute(command);

    // Assert
    expect(outputPort.presentValidationError).toHaveBeenCalledWith([
      'At least one field must be provided for update',
    ]);
    expect(articleRepository.save).not.toHaveBeenCalled();
  });

  it('should present server error when repository throws', async () => {
    // Arrange
    const command = new UpdateArticleCommand(mockArticle.id, 'Updated Title');
    articleRepository.findById.mockRejectedValue(new Error('Database error'));

    // Act
    await handler.execute(command);

    // Assert
    expect(outputPort.presentServerError).toHaveBeenCalledWith(
      'Failed to update article: Database error',
    );
  });
});
