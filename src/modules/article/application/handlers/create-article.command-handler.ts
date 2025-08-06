import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateArticleCommand } from '../commands';
import { CreateArticleOutputPort } from '../ports/output.ports';
import { ArticleRepository } from '../../domain/repositories/article.repository';
import { AuthorRepository } from '../../../author/domain/repositories/author.repository';
import { Article } from '../../domain/entities/article.entity';
import { ArticleTitle } from '../../domain/value-objects/article-title.value-object';
import { ArticleContent } from '../../domain/value-objects/article-content.value-object';

@Injectable()
@CommandHandler(CreateArticleCommand)
export class CreateArticleCommandHandler implements ICommandHandler<CreateArticleCommand> {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly authorRepository: AuthorRepository,
    private readonly outputPort: CreateArticleOutputPort,
  ) {}

  async execute(command: CreateArticleCommand): Promise<void> {
    try {
      const validationErrors: string[] = [];

      let title: ArticleTitle;
      let content: ArticleContent;

      try {
        title = new ArticleTitle({ value: command.title });
      } catch (error) {
        validationErrors.push(error.message);
      }

      try {
        content = new ArticleContent({ value: command.content });
      } catch (error) {
        validationErrors.push(error.message);
      }

      if (validationErrors.length > 0) {
        await this.outputPort.presentValidationError(validationErrors);

        return;
      }

      const author = await this.authorRepository.findById(command.authorId);
      if (!author) {
        await this.outputPort.presentNotFoundError('Author not found');

        return;
      }

      const article = Article.create(title!, content!, author);

      const savedArticle = await this.articleRepository.save(article);

      await this.outputPort.presentSuccess(savedArticle);
    } catch (error) {
      await this.outputPort.presentServerError(
        `Failed to create article: ${error.message}`,
      );
    }
  }
}
