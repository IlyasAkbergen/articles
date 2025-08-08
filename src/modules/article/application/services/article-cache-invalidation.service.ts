import { Injectable } from '@nestjs/common';
import { CacheService } from '../services/cache.service';

@Injectable()
export class ArticleCacheInvalidationService {
  private readonly CACHE_PATTERNS = {
    ARTICLES: 'articles:*',
    ARTICLE_BY_ID: 'article:*',
    ARTICLES_BY_AUTHOR: 'articles_by_author:*',
  };

  constructor(private readonly cacheService: CacheService) {}

  async invalidateAllArticlesCaches(): Promise<void> {
    await Promise.all([
      this.cacheService.delPattern(this.CACHE_PATTERNS.ARTICLES),
      this.cacheService.delPattern(this.CACHE_PATTERNS.ARTICLES_BY_AUTHOR),
    ]);
  }

  async invalidateArticleCache(articleId: string): Promise<void> {
    await this.cacheService.del(`article:${articleId}`);
  }

  async invalidateAuthorArticlesCache(authorId: string): Promise<void> {
    await this.cacheService.delPattern(`articles_by_author:${authorId}:*`);
  }

  async invalidateOnArticleUpdate(articleId: string, authorId?: string): Promise<void> {
    await Promise.all([
      this.invalidateAllArticlesCaches(),
      this.invalidateArticleCache(articleId),
      ...(authorId ? [this.invalidateAuthorArticlesCache(authorId)] : []),
    ]);
  }

  async invalidateOnArticleCreate(authorId: string): Promise<void> {
    await Promise.all([
      this.invalidateAllArticlesCaches(),
      this.invalidateAuthorArticlesCache(authorId),
    ]);
  }

  async invalidateOnArticleDelete(articleId: string, authorId: string): Promise<void> {
    await Promise.all([
      this.invalidateAllArticlesCaches(),
      this.invalidateArticleCache(articleId),
      this.invalidateAuthorArticlesCache(authorId),
    ]);
  }
}
