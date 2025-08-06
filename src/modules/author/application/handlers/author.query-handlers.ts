import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAllAuthorsQuery, GetAuthorByIdQuery, GetAuthorByEmailQuery } from '../queries/author.queries';
import { Author } from '../../domain/entities/author.entity';
import { AuthorRepository } from '../../domain/repositories/author.repository';

@QueryHandler(GetAllAuthorsQuery)
export class GetAllAuthorsQueryHandler implements IQueryHandler<GetAllAuthorsQuery> {
  constructor(private readonly authorRepository: AuthorRepository) {}

  async execute(): Promise<Author[]> {
    return await this.authorRepository.findAll();
  }
}

@QueryHandler(GetAuthorByIdQuery)
export class GetAuthorByIdQueryHandler implements IQueryHandler<GetAuthorByIdQuery> {
  constructor(private readonly authorRepository: AuthorRepository) {}

  async execute(query: GetAuthorByIdQuery): Promise<Author | null> {
    return await this.authorRepository.findById(query.id);
  }
}

@QueryHandler(GetAuthorByEmailQuery)
export class GetAuthorByEmailQueryHandler implements IQueryHandler<GetAuthorByEmailQuery> {
  constructor(private readonly authorRepository: AuthorRepository) {}

  async execute(query: GetAuthorByEmailQuery): Promise<Author | null> {
    return await this.authorRepository.findByEmail(query.email);
  }
}
