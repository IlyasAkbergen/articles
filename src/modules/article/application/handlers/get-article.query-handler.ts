import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetArticleQuery } from '../queries';
import { GetArticleOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';

@Injectable()
@QueryHandler(GetArticleQuery)
export class GetArticleQueryHandler implements IQueryHandler<GetArticleQuery> {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly outputPort: GetArticleOutputPort,
  ) {}

  async execute(query: GetArticleQuery): Promise<void> {
    try {
      const article = await this.articleRepository.findById(query.id);

      if (!article) {
        await this.outputPort.presentNotFoundError('Article not found');

        return;
      }

      await this.outputPort.presentSuccess(article);
    } catch (error) {
      await this.outputPort.presentServerError(
        `Failed to get article: ${error.message}`,
      );
    }
  }
}
