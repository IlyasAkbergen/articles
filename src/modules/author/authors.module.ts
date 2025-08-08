import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthorRepository } from './domain/repositories/author.repository';

import { AuthorEntity } from './infrastructure/persistence/author.entity';
import { TypeOrmAuthorRepository } from './infrastructure/persistence/typeorm-author.repository';

import { 
  CreateAuthorCommandHandler,
  GetAllAuthorsQueryHandler,
  GetAuthorByIdQueryHandler,
  GetAuthorByEmailQueryHandler
} from './application/handlers';

import { AuthorsController } from './presentation/controllers/authors.controller';

const CommandHandlers = [CreateAuthorCommandHandler];
const QueryHandlers = [
  GetAllAuthorsQueryHandler,
  GetAuthorByIdQueryHandler,
  GetAuthorByEmailQueryHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthorEntity]),
    CqrsModule,
  ],
  controllers: [AuthorsController],
  providers: [
    {
      provide: AuthorRepository,
      useClass: TypeOrmAuthorRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [AuthorRepository],
})
export class AuthorsModule {}
