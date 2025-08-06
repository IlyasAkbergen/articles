import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorsModule } from '../author/authors.module';

// Domain
import { ArticleRepository } from './domain/repositories/article.repository';

// Application
import {
  CreateArticleOutputPort,
  UpdateArticleOutputPort,
  DeleteArticleOutputPort,
  GetArticleOutputPort,
  GetAllArticlesOutputPort,
  PublishArticleOutputPort,
} from './application/ports/output.ports';

import {
  CreateArticleCommandHandler,
  UpdateArticleCommandHandler,
  DeleteArticleCommandHandler,
  PublishArticleCommandHandler,
  UnpublishArticleCommandHandler,
  GetArticleQueryHandler,
  GetAllArticlesQueryHandler,
  GetArticlesByAuthorQueryHandler,
} from './application/handlers';

// Infrastructure
import { ArticleEntity } from './infrastructure/persistence/article.entity';
import { TypeOrmArticleRepository } from './infrastructure/persistence/typeorm-article.repository';

// Presentation
import { ArticlesController } from './presentation/controllers/articles.controller';
import {
  CreateArticleRestPresenter,
  UpdateArticleRestPresenter,
  DeleteArticleRestPresenter,
  GetArticleRestPresenter,
  GetAllArticlesRestPresenter,
  PublishArticleRestPresenter,
} from './presentation/presenters/article-rest.presenter';

const CommandHandlers = [
  CreateArticleCommandHandler,
  UpdateArticleCommandHandler,
  DeleteArticleCommandHandler,
  PublishArticleCommandHandler,
  UnpublishArticleCommandHandler,
];

const QueryHandlers = [
  GetArticleQueryHandler,
  GetAllArticlesQueryHandler,
  GetArticlesByAuthorQueryHandler,
];

const Presenters = [
  CreateArticleRestPresenter,
  UpdateArticleRestPresenter,
  DeleteArticleRestPresenter,
  GetArticleRestPresenter,
  GetAllArticlesRestPresenter,
  PublishArticleRestPresenter,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([ArticleEntity]),
    AuthorsModule,
  ],
  controllers: [ArticlesController],
  providers: [
    // Repository implementations
    {
      provide: ArticleRepository,
      useClass: TypeOrmArticleRepository,
    },
    
    // Output port implementations (presenters) - using existing instances
    {
      provide: CreateArticleOutputPort,
      useExisting: CreateArticleRestPresenter,
    },
    {
      provide: UpdateArticleOutputPort,
      useExisting: UpdateArticleRestPresenter,
    },
    {
      provide: DeleteArticleOutputPort,
      useExisting: DeleteArticleRestPresenter,
    },
    {
      provide: GetArticleOutputPort,
      useExisting: GetArticleRestPresenter,
    },
    {
      provide: GetAllArticlesOutputPort,
      useExisting: GetAllArticlesRestPresenter,
    },
    {
      provide: PublishArticleOutputPort,
      useExisting: PublishArticleRestPresenter,
    },
    
    // Handlers
    ...CommandHandlers,
    ...QueryHandlers,
    
    // Presenters for controller injection
    ...Presenters,
  ],
  exports: [ArticleRepository],
})
export class ArticlesModule {}
