import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetArticlesByAuthorQuery } from '../queries';
import { GetAllArticlesOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';

@Injectable()
@QueryHandler(GetArticlesByAuthorQuery)
export class GetArticlesByAuthorQueryHandler implements IQueryHandler<GetArticlesByAuthorQuery> {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly outputPort: GetAllArticlesOutputPort,
  ) {}

  async execute(query: GetArticlesByAuthorQuery): Promise<void> {
    try {
      const articles = await this.articleRepository.findByAuthorId(query.authorId);

      await this.outputPort.presentSuccess(articles);
    } catch (error) {
      await this.outputPort.presentServerError(
        `Failed to get articles by author: ${error.message}`,
      );
    }
  }
}
