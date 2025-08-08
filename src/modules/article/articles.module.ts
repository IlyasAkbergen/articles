import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthorsModule } from '../author/authors.module';

import { ArticleRepository } from './domain/repositories/article.repository';

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

import { CacheService } from './application/services/cache.service';
import { ArticleCacheInvalidationService } from './application/services/article-cache-invalidation.service';

import { ArticleEntity } from './infrastructure/persistence/article.entity';
import { TypeOrmArticleRepository } from './infrastructure/persistence/typeorm-article.repository';
import { RedisCacheService } from './infrastructure/cache/redis-cache.service';

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
    ConfigModule,
    TypeOrmModule.forFeature([ArticleEntity]),
    AuthorsModule,
  ],
  controllers: [ArticlesController],
  providers: [
    {
      provide: ArticleRepository,
      useClass: TypeOrmArticleRepository,
    },
    
    {
      provide: CacheService,
      useClass: RedisCacheService,
    },
    
    ArticleCacheInvalidationService,
    
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
    
    ...CommandHandlers,
    ...QueryHandlers,
    
    ...Presenters,
  ],
  exports: [ArticleRepository],
})
export class ArticlesModule {}
