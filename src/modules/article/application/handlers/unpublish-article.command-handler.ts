import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { UnpublishArticleCommand } from '../commands';
import { PublishArticleOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';
import { ArticleCacheInvalidationService } from '../services/article-cache-invalidation.service';

@Injectable()
@CommandHandler(UnpublishArticleCommand)
export class UnpublishArticleCommandHandler implements ICommandHandler<UnpublishArticleCommand> {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly outputPort: PublishArticleOutputPort,
    private readonly cacheInvalidationService: ArticleCacheInvalidationService,
  ) {}

  async execute(command: UnpublishArticleCommand): Promise<void> {
    try {
      // Find the article
      const article = await this.articleRepository.findById(command.id);
      if (!article) {
        await this.outputPort.presentNotFoundError('Article not found');

        return;
      }

      // Unpublish the article (domain logic will handle validation)
      try {
        const unpublishedArticle = article.unpublish();
        const savedArticle = await this.articleRepository.save(unpublishedArticle);

        // Invalidate cache after unpublishing article
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
        `Failed to unpublish article: ${error.message}`,
      );
    }
  }
}
