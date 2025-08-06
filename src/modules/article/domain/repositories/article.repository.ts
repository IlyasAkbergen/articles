import { Article } from '../entities/article.entity';

export abstract class ArticleRepository {
  abstract save(article: Article): Promise<Article>;
  abstract findById(id: string): Promise<Article | null>;
  abstract findAll(): Promise<Article[]>;
  abstract findByAuthorId(authorId: string): Promise<Article[]>;
  abstract delete(id: string): Promise<void>;
}
