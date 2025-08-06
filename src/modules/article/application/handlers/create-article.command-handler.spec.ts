import { Test, TestingModule } from '@nestjs/testing';
import { CreateArticleCommandHandler } from './create-article.command-handler';
import { CreateArticleCommand } from '../commands';
import { CreateArticleOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';
import { AuthorRepository } from '../../../author/domain/repositories/author.repository';
import { Author } from '../../../author/domain/entities/author.entity';
import { FullName } from '../../../author/domain/value-objects/full-name.value-object';
import { Email } from '../../../author/domain/value-objects/email.value-object';
import { Article } from '../../domain/entities/article.entity';
import { ArticleTitle } from '../../domain/value-objects/article-title.value-object';
import { ArticleContent } from '../../domain/value-objects/article-content.value-object';

describe('CreateArticleCommandHandler', () => {
  let handler: CreateArticleCommandHandler;
  let articleRepository: jest.Mocked<ArticleRepository>;
  let authorRepository: jest.Mocked<AuthorRepository>;
  let outputPort: jest.Mocked<CreateArticleOutputPort>;
  let mockAuthor: Author;

  beforeEach(async () => {
    const mockArticleRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByAuthorId: jest.fn(),
      delete: jest.fn(),
    };

    const mockAuthorRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
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
        CreateArticleCommandHandler,
        {
          provide: ArticleRepository,
          useValue: mockArticleRepository,
        },
        {
          provide: AuthorRepository,
          useValue: mockAuthorRepository,
        },
        {
          provide: CreateArticleOutputPort,
          useValue: mockOutputPort,
        },
      ],
    }).compile();

    handler = module.get<CreateArticleCommandHandler>(CreateArticleCommandHandler);
    articleRepository = module.get(ArticleRepository);
    authorRepository = module.get(AuthorRepository);
    outputPort = module.get(CreateArticleOutputPort);

    // Create a mock author for testing
    mockAuthor = Author.create(
      new FullName({ firstName: 'Iliyas', lastName: 'Akbergen' }),
      new Email('iliyas.akbergen@gmail.com'),
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should create article successfully', async () => {
    // Arrange
    const command = new CreateArticleCommand(
      'Test Article Title',
      'This is test article content',
      mockAuthor.id,
    );

    const mockArticle = Article.create(
      new ArticleTitle({ value: command.title }),
      new ArticleContent({ value: command.content }),
      mockAuthor,
    );

    authorRepository.findById.mockResolvedValue(mockAuthor);
    articleRepository.save.mockResolvedValue(mockArticle);

    // Act
    await handler.execute(command);

    // Assert
    expect(authorRepository.findById).toHaveBeenCalledWith(command.authorId);
    expect(articleRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.objectContaining({ value: command.title }),
        content: expect.objectContaining({ value: command.content }),
        author: mockAuthor,
        isPublished: false,
      }),
    );
    expect(outputPort.presentSuccess).toHaveBeenCalledWith(mockArticle);
  });

  it('should present validation error for empty title', async () => {
    // Arrange
    const command = new CreateArticleCommand(
      '',
      'This is test article content',
      mockAuthor.id,
    );

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
    const command = new CreateArticleCommand(
      'Test Article Title',
      '',
      mockAuthor.id,
    );

    // Act
    await handler.execute(command);

    // Assert
    expect(outputPort.presentValidationError).toHaveBeenCalledWith([
      'Content cannot be empty',
    ]);
    expect(articleRepository.save).not.toHaveBeenCalled();
  });

  it('should present not found error when author does not exist', async () => {
    // Arrange
    const command = new CreateArticleCommand(
      'Test Article Title',
      'This is test article content',
      'non-existent-author-id',
    );

    authorRepository.findById.mockResolvedValue(null);

    // Act
    await handler.execute(command);

    // Assert
    expect(authorRepository.findById).toHaveBeenCalledWith('non-existent-author-id');
    expect(outputPort.presentNotFoundError).toHaveBeenCalledWith('Author not found');
    expect(articleRepository.save).not.toHaveBeenCalled();
  });

  it('should present server error when repository throws', async () => {
    // Arrange
    const command = new CreateArticleCommand(
      'Test Article Title',
      'This is test article content',
      mockAuthor.id,
    );

    authorRepository.findById.mockResolvedValue(mockAuthor);
    articleRepository.save.mockRejectedValue(new Error('Database error'));

    // Act
    await handler.execute(command);

    // Assert
    expect(outputPort.presentServerError).toHaveBeenCalledWith(
      'Failed to create article: Database error',
    );
  });
});
