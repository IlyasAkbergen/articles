import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { DeleteArticleCommand } from '../commands';
import { DeleteArticleOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';

@Injectable()
@CommandHandler(DeleteArticleCommand)
export class DeleteArticleCommandHandler implements ICommandHandler<DeleteArticleCommand> {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly outputPort: DeleteArticleOutputPort,
  ) {}

  async execute(command: DeleteArticleCommand): Promise<void> {
    try {
      // Check if article exists
      const article = await this.articleRepository.findById(command.id);
      if (!article) {
        await this.outputPort.presentNotFoundError('Article not found');

        return;
      }

      // Delete the article
      await this.articleRepository.delete(command.id);

      await this.outputPort.presentSuccess();
    } catch (error) {
      await this.outputPort.presentServerError(
        `Failed to delete article: ${error.message}`,
      );
    }
  }
}
