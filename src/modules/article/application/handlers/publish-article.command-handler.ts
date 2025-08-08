import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PublishArticleCommand } from '../commands';
import { PublishArticleOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';
import { ArticleCacheInvalidationService } from '../services/article-cache-invalidation.service';

@Injectable()
@CommandHandler(PublishArticleCommand)
export class PublishArticleCommandHandler implements ICommandHandler<PublishArticleCommand> {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly outputPort: PublishArticleOutputPort,
    private readonly cacheInvalidationService: ArticleCacheInvalidationService,
  ) {}

  async execute(command: PublishArticleCommand): Promise<void> {
    try {
      // Find the article
      const article = await this.articleRepository.findById(command.id);
      if (!article) {
        await this.outputPort.presentNotFoundError('Article not found');

        return;
      }

      // Publish the article (domain logic will handle validation)
      try {
        const publishedArticle = article.publish();
        const savedArticle = await this.articleRepository.save(publishedArticle);

        // Invalidate cache after publishing article
        await this.cacheInvalidationService.invalidateOnArticleUpdate(
          savedArticle.id,
          savedArticle.author.id,
        );

        await this.outputPort.presentSuccess(savedArticle);
      } catch (domainError) {
        await this.outputPort.presentValidationError([domainError.message]);
      }
    } catch (error) {
      await this.outputPort.presentServerError(
        `Failed to publish article: ${error.message}`,
      );
    }
  }
}
