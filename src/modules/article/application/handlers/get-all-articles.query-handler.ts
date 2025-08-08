import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetAllArticlesQuery } from '../queries';
import { GetAllArticlesOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';
import { CacheService } from '../services/cache.service';
import { PaginationResult } from '../../domain/interfaces/pagination.interface';
import { Article } from '../../domain/entities/article.entity';

@Injectable()
@QueryHandler(GetAllArticlesQuery)
export class GetAllArticlesQueryHandler implements IQueryHandler<GetAllArticlesQuery> {
  private readonly CACHE_PREFIX = 'articles';
  private readonly CACHE_TTL = 300;

  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly outputPort: GetAllArticlesOutputPort,
    private readonly cacheService: CacheService,
  ) {}

  async execute(query: GetAllArticlesQuery): Promise<void> {
    try {
      if (!query.paginationOptions) {
        const articles = await this.articleRepository.findAll();
        await this.outputPort.presentSuccess(articles);
        return;
      }

      const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, query.paginationOptions);
      
      const cachedResult = await this.cacheService.get<PaginationResult<Article>>(cacheKey);
      if (cachedResult) {
        await this.outputPort.presentSuccessPaginated(cachedResult);
        return;
      }

      const result = await this.articleRepository.findAllPaginated(query.paginationOptions);

      await this.cacheService.set(cacheKey, result, { ttl: this.CACHE_TTL });

      await this.outputPort.presentSuccessPaginated(result);
    } catch (error) {
      await this.outputPort.presentServerError(
        `Failed to get articles: ${error.message}`,
      );
    }
  }
}
