import { Article } from './article.entity';
import { Author } from '../../../author/domain/entities/author.entity';
import { FullName } from '../../../author/domain/value-objects/full-name.value-object';
import { Email } from '../../../author/domain/value-objects/email.value-object';
import { ArticleTitle } from '../value-objects/article-title.value-object';
import { ArticleContent } from '../value-objects/article-content.value-object';
import { ArticleAlreadyPublishedException, ArticleAlreadyUnpublishedException } from '../exceptions/article.exceptions';

describe('Article Entity', () => {
  const validAuthor = Author.create(
    new FullName({ firstName: 'Iliyas', lastName: 'Akbergen' }),
    new Email('iliyas.akbergen@gmail.com'),
  );

  describe('creating a new article', () => {
    it('should create an article with valid data', () => {
      const title = new ArticleTitle({ value: 'Test Article' });
      const content = new ArticleContent({ value: 'This is test content' });

      const article = Article.create(title, content, validAuthor);

      expect(article.id).toBeDefined();
      expect(article.title).toBe(title);
      expect(article.content).toBe(content);
      expect(article.author).toBe(validAuthor);
      expect(article.createdAt).toBeInstanceOf(Date);
      expect(article.updatedAt).toBeInstanceOf(Date);
      expect(article.isPublished).toBe(false);
    });

    it('should throw error when title is empty', () => {
      expect(() => new ArticleTitle({ value: '' })).toThrow(
        'Title cannot be empty',
      );
    });

    it('should throw error when content is empty', () => {
      expect(() => new ArticleContent({ value: '' })).toThrow(
        'Content cannot be empty',
      );
    });

    it('should throw error when title exceeds maximum length', () => {
      expect(() => new ArticleTitle({ value: 'a'.repeat(256) })).toThrow(
        'Title cannot exceed 255 characters',
      );
    });
  });

  describe('updating an article', () => {
    let article: Article;

    beforeEach(() => {
      const title = new ArticleTitle({ value: 'Original Title' });
      const content = new ArticleContent({ value: 'Original content' });
      article = Article.create(title, content, validAuthor);
    });

    it('should return new instance with updated title', () => {
      const newTitle = new ArticleTitle({ value: 'Updated Title' });
      const updatedArticle = article.updateTitle(newTitle);

      expect(updatedArticle.title).toBe(newTitle);
      expect(updatedArticle.id).toBe(article.id);
      expect(updatedArticle.content).toBe(article.content);
      expect(updatedArticle.author).toBe(article.author);
      expect(updatedArticle.updatedAt).not.toBe(article.updatedAt);
      expect(updatedArticle).not.toBe(article);
    });

    it('should return new instance with updated content', () => {
      const newContent = new ArticleContent({ value: 'Updated content' });
      const updatedArticle = article.updateContent(newContent);

      expect(updatedArticle.content).toBe(newContent);
      expect(updatedArticle.id).toBe(article.id);
      expect(updatedArticle.title).toBe(article.title);
      expect(updatedArticle.author).toBe(article.author);
      expect(updatedArticle.updatedAt).not.toBe(article.updatedAt);
      expect(updatedArticle).not.toBe(article);
    });

    it('should throw error when updating with empty title', () => {
      expect(() => new ArticleTitle({ value: '' })).toThrow(
        'Title cannot be empty',
      );
    });

    it('should throw error when updating with empty content', () => {
      expect(() => new ArticleContent({ value: '' })).toThrow(
        'Content cannot be empty',
      );
    });
  });

  describe('publishing an article', () => {
    let article: Article;

    beforeEach(() => {
      const title = new ArticleTitle({ value: 'Test Article' });
      const content = new ArticleContent({ value: 'This is test content' });
      article = Article.create(title, content, validAuthor);
    });

    it('should return new instance when publishing an unpublished article', () => {
      const publishedArticle = article.publish();

      expect(publishedArticle.isPublished).toBe(true);
      expect(publishedArticle.publishedAt).toBeInstanceOf(Date);
      expect(publishedArticle.id).toBe(article.id);
      expect(publishedArticle.title).toBe(article.title);
      expect(publishedArticle).not.toBe(article);
    });

    it('should throw error when trying to publish already published article', () => {
      const publishedArticle = article.publish();

      expect(() => publishedArticle.publish()).toThrow(ArticleAlreadyPublishedException);
    });

    it('should return new instance when unpublishing a published article', () => {
      const publishedArticle = article.publish();
      const unpublishedArticle = publishedArticle.unpublish();

      expect(unpublishedArticle.isPublished).toBe(false);
      expect(unpublishedArticle.publishedAt).toBeNull();
      expect(unpublishedArticle.id).toBe(article.id);
      expect(unpublishedArticle).not.toBe(publishedArticle);
    });

    it('should throw error when trying to unpublish already unpublished article', () => {
      expect(() => article.unpublish()).toThrow(ArticleAlreadyUnpublishedException);
    });
  });

  describe('article reconstruction', () => {
    it('should reconstruct article from existing data', () => {
      const title = new ArticleTitle({ value: 'Existing Article' });
      const content = new ArticleContent({ value: 'Existing content' });

      const article = Article.reconstruct(
        '123',
        title,
        content,
        validAuthor,
        true,
        new Date('2023-01-01'),
        new Date('2023-01-02'),
        new Date('2023-01-03'),
      );

      expect(article.id).toBe('123');
      expect(article.title).toBe(title);
      expect(article.content).toBe(content);
      expect(article.author).toBe(validAuthor);
      expect(article.isPublished).toBe(true);
      expect(article.createdAt).toEqual(new Date('2023-01-01'));
      expect(article.updatedAt).toEqual(new Date('2023-01-02'));
      expect(article.publishedAt).toEqual(new Date('2023-01-03'));
    });
  });
});
