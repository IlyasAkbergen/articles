import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { UpdateArticleCommand } from '../commands';
import { UpdateArticleOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';
import { ArticleTitle } from '../../domain/value-objects/article-title.value-object';
import { ArticleContent } from '../../domain/value-objects/article-content.value-object';

@Injectable()
@CommandHandler(UpdateArticleCommand)
export class UpdateArticleCommandHandler implements ICommandHandler<UpdateArticleCommand> {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly outputPort: UpdateArticleOutputPort,
  ) {}

  async execute(command: UpdateArticleCommand): Promise<void> {
    try {
      // Validate that at least one field is provided
      if (command.title === undefined && command.content === undefined) {
        await this.outputPort.presentValidationError([
          'At least one field must be provided for update',
        ]);

        return;
      }

      // Find the article
      const article = await this.articleRepository.findById(command.id);
      if (!article) {
        await this.outputPort.presentNotFoundError('Article not found');

        return;
      }

      // Validate input
      const validationErrors: string[] = [];
      let newTitle: ArticleTitle | undefined;
      let newContent: ArticleContent | undefined;

      if (command.title !== undefined) {
        try {
          newTitle = new ArticleTitle({ value: command.title });
        } catch (error) {
          validationErrors.push(error.message);
        }
      }

      if (command.content !== undefined) {
        try {
          newContent = new ArticleContent({ value: command.content });
        } catch (error) {
          validationErrors.push(error.message);
        }
      }

      if (validationErrors.length > 0) {
        await this.outputPort.presentValidationError(validationErrors);

        return;
      }

      // Update the article
      let updatedArticle = article;

      if (newTitle) {
        updatedArticle = updatedArticle.updateTitle(newTitle);
      }

      if (newContent) {
        updatedArticle = updatedArticle.updateContent(newContent);
      }

      // Save the updated article
      const savedArticle = await this.articleRepository.save(updatedArticle);

      await this.outputPort.presentSuccess(savedArticle);
    } catch (error) {
      await this.outputPort.presentServerError(
        `Failed to update article: ${error.message}`,
      );
    }
  }
}
