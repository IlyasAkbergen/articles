import { Article } from '../../domain/entities/article.entity';

export abstract class CreateArticleOutputPort {
  abstract presentSuccess(article: Article): Promise<void>;
  abstract presentValidationError(errors: string[]): Promise<void>;
  abstract presentNotFoundError(message: string): Promise<void>;
  abstract presentServerError(message: string): Promise<void>;
}

export abstract class UpdateArticleOutputPort {
  abstract presentSuccess(article: Article): Promise<void>;
  abstract presentValidationError(errors: string[]): Promise<void>;
  abstract presentNotFoundError(message: string): Promise<void>;
  abstract presentServerError(message: string): Promise<void>;
}

export abstract class DeleteArticleOutputPort {
  abstract presentSuccess(): Promise<void>;
  abstract presentNotFoundError(message: string): Promise<void>;
  abstract presentServerError(message: string): Promise<void>;
}

export abstract class GetArticleOutputPort {
  abstract presentSuccess(article: Article): Promise<void>;
  abstract presentNotFoundError(message: string): Promise<void>;
  abstract presentServerError(message: string): Promise<void>;
}

export abstract class GetAllArticlesOutputPort {
  abstract presentSuccess(articles: Article[]): Promise<void>;
  abstract presentServerError(message: string): Promise<void>;
}

export abstract class PublishArticleOutputPort {
  abstract presentSuccess(article: Article): Promise<void>;
  abstract presentValidationError(errors: string[]): Promise<void>;
  abstract presentNotFoundError(message: string): Promise<void>;
  abstract presentServerError(message: string): Promise<void>;
}
