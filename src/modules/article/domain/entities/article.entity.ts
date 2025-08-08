import { v4 as uuidv4 } from 'uuid';
import { Author } from '../../../author/domain/entities/author.entity';
import { ArticleTitle } from '../value-objects/article-title.value-object';
import { ArticleContent } from '../value-objects/article-content.value-object';
import { 
  ArticleAlreadyPublishedException, 
  ArticleAlreadyUnpublishedException 
} from '../exceptions/article.exceptions';

export class Article {
  private constructor(
    public readonly id: string,
    public readonly title: ArticleTitle,
    public readonly content: ArticleContent,
    public readonly author: Author,
    public readonly isPublished: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly publishedAt: Date | null,
  ) {}

  static create(
    title: ArticleTitle,
    content: ArticleContent,
    author: Author,
  ): Article {
    const now = new Date();

    return new Article(uuidv4(), title, content, author, false, now, now, null);
  }

  static reconstruct(
    id: string,
    title: ArticleTitle,
    content: ArticleContent,
    author: Author,
    isPublished: boolean,
    createdAt: Date,
    updatedAt: Date,
    publishedAt: Date | null,
  ): Article {
    return new Article(
      id,
      title,
      content,
      author,
      isPublished,
      createdAt,
      updatedAt,
      publishedAt,
    );
  }

  updateTitle(title: ArticleTitle): Article {
    return new Article(
      this.id,
      title,
      this.content,
      this.author,
      this.isPublished,
      this.createdAt,
      new Date(),
      this.publishedAt,
    );
  }

  updateContent(content: ArticleContent): Article {
    return new Article(
      this.id,
      this.title,
      content,
      this.author,
      this.isPublished,
      this.createdAt,
      new Date(),
      this.publishedAt,
    );
  }

  publish(): Article {
    if (this.isPublished) {
      throw new ArticleAlreadyPublishedException();
    }

    return new Article(
      this.id,
      this.title,
      this.content,
      this.author,
      true,
      this.createdAt,
      new Date(),
      new Date(),
    );
  }

  unpublish(): Article {
    if (!this.isPublished) {
      throw new ArticleAlreadyUnpublishedException();
    }

    return new Article(
      this.id,
      this.title,
      this.content,
      this.author,
      false,
      this.createdAt,
      new Date(),
      null,
    );
  }
}
