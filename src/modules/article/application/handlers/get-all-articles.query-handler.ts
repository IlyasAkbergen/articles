import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetAllArticlesQuery } from '../queries';
import { GetAllArticlesOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';

@Injectable()
@QueryHandler(GetAllArticlesQuery)
export class GetAllArticlesQueryHandler implements IQueryHandler<GetAllArticlesQuery> {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly outputPort: GetAllArticlesOutputPort,
  ) {}

  async execute(query: GetAllArticlesQuery): Promise<void> {
    try {
      const articles = await this.articleRepository.findAll();

      await this.outputPort.presentSuccess(articles);
    } catch (error) {
      await this.outputPort.presentServerError(
        `Failed to get articles: ${error.message}`,
      );
    }
  }
}
