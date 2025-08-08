import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { DeleteArticleCommand } from '../commands';
import { DeleteArticleOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';
import { ArticleCacheInvalidationService } from '../services/article-cache-invalidation.service';

@Injectable()
@CommandHandler(DeleteArticleCommand)
export class DeleteArticleCommandHandler implements ICommandHandler<DeleteArticleCommand> {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly outputPort: DeleteArticleOutputPort,
    private readonly cacheInvalidationService: ArticleCacheInvalidationService,
  ) {}

  async execute(command: DeleteArticleCommand): Promise<void> {
    try {
      // Find the article first to get author information for cache invalidation
      const article = await this.articleRepository.findById(command.id);
      if (!article) {
        await this.outputPort.presentNotFoundError('Article not found');

        return;
      }

      // Delete the article
      await this.articleRepository.delete(command.id);

      // Invalidate cache after deleting article
      await this.cacheInvalidationService.invalidateOnArticleDelete(
        command.id,
        article.author.id,
      );

      await this.outputPort.presentSuccess();
    } catch (error) {
      await this.outputPort.presentServerError(
        `Failed to delete article: ${error.message}`,
      );
    }
  }
}
