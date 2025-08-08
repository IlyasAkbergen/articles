import { Article } from '../entities/article.entity';
import { PaginationOptions, PaginationResult } from '../interfaces/pagination.interface';

export abstract class ArticleRepository {
  abstract save(article: Article): Promise<Article>;
  abstract findById(id: string): Promise<Article | null>;
  abstract findAll(): Promise<Article[]>;
  abstract findAllPaginated(options: PaginationOptions): Promise<PaginationResult<Article>>;
  abstract findByAuthorId(authorId: string): Promise<Article[]>;
  abstract delete(id: string): Promise<void>;
}
