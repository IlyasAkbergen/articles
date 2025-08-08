import { Test, TestingModule } from '@nestjs/testing';
import { CreateAuthorCommandHandler } from './create-author.command-handler';
import { AuthorRepository } from '../../domain/repositories/author.repository';
import { CreateAuthorCommand } from '../commands/create-author.command';
import { Author } from '../../domain/entities/author.entity';
import { FullName } from '../../domain/value-objects/full-name.value-object';
import { Email } from '../../domain/value-objects/email.value-object';
import { AuthorAlreadyExistsException } from '../../domain/exceptions/author.exceptions';

describe('CreateAuthorCommandHandler', () => {
  let handler: CreateAuthorCommandHandler;
  let authorRepository: jest.Mocked<AuthorRepository>;

  beforeEach(async () => {
    const mockAuthorRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAuthorCommandHandler,
        {
          provide: AuthorRepository,
          useValue: mockAuthorRepository,
        },
      ],
    }).compile();

    handler = module.get<CreateAuthorCommandHandler>(CreateAuthorCommandHandler);
    authorRepository = module.get<AuthorRepository>(AuthorRepository) as jest.Mocked<AuthorRepository>;
  });

  describe('execute', () => {
    const validCommand = new CreateAuthorCommand(
      'Iliyas',
      'Akbergen',
      'iliyas.akbergen@gmail.com'
    );

  it('should create author successfully', async () => {
    const command = new CreateAuthorCommand(
      'Iliyas',
      'Akbergen',
      'iliyas.akbergen@gmail.com',
    );

    const mockAuthor = Author.create(
      new FullName({ firstName: 'Iliyas', lastName: 'Akbergen' }),
      new Email('iliyas.akbergen@gmail.com'),
    );

    authorRepository.findByEmail.mockResolvedValue(null);
    authorRepository.save.mockResolvedValue(mockAuthor);

    await handler.execute(command);

    expect(authorRepository.findByEmail).toHaveBeenCalledWith(
      'iliyas.akbergen@gmail.com',
    );
    expect(authorRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: expect.objectContaining({
          firstName: 'Iliyas',
          lastName: 'Akbergen',
        }),
        email: expect.objectContaining({ value: 'iliyas.akbergen@gmail.com' }),
      }),
    );
  });    it('should throw AuthorAlreadyExistsException when email already exists', async () => {
      const existingAuthor = Author.create(
        new FullName({ firstName: 'John', lastName: 'Doe' }),
        new Email('iliyas.akbergen@gmail.com')
      );
      authorRepository.findByEmail.mockResolvedValue(existingAuthor);

      await expect(handler.execute(validCommand))
        .rejects
        .toThrow(AuthorAlreadyExistsException);
      
      expect(authorRepository.findByEmail).toHaveBeenCalledWith('iliyas.akbergen@gmail.com');
      expect(authorRepository.save).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const invalidCommand = new CreateAuthorCommand(
        'Iliyas',
        'Akbergen',
        'invalid-email'
      );
      authorRepository.findByEmail.mockResolvedValue(null);

      await expect(handler.execute(invalidCommand))
        .rejects
        .toThrow('Email format is invalid');
    });

    it('should validate full name requirements', async () => {
      const invalidCommand = new CreateAuthorCommand(
        '',
        'Akbergen',
        'test@example.com'
      );
      authorRepository.findByEmail.mockResolvedValue(null);

      await expect(handler.execute(invalidCommand))
        .rejects
        .toThrow('First name cannot be empty');
    });
  });
});
