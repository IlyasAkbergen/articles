import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAuthorCommand } from '../commands/create-author.command';
import { Author } from '../../domain/entities/author.entity';
import { AuthorRepository } from '../../domain/repositories/author.repository';
import { FullName } from '../../domain/value-objects/full-name.value-object';
import { Email } from '../../domain/value-objects/email.value-object';
import { AuthorAlreadyExistsException } from '../../domain/exceptions/author.exceptions';

@CommandHandler(CreateAuthorCommand)
export class CreateAuthorCommandHandler implements ICommandHandler<CreateAuthorCommand> {
  constructor(private readonly authorRepository: AuthorRepository) {}

  async execute(command: CreateAuthorCommand): Promise<Author> {
    const { firstName, lastName, email } = command;

    // Check if author with this email already exists
    const existingAuthor = await this.authorRepository.findByEmail(email);
    if (existingAuthor) {
      throw new AuthorAlreadyExistsException(email);
    }

    // Create value objects
    const fullName = new FullName({ firstName, lastName });
    const emailVO = new Email(email);

    // Create and save the author
    const author = Author.create(fullName, emailVO);
    return await this.authorRepository.save(author);
  }
}
