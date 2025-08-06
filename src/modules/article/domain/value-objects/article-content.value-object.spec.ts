import { ArticleContent } from './article-content.value-object';

describe('ArticleContent Value Object', () => {
  describe('creating valid content', () => {
    it('should create content with valid value', () => {
      const content = new ArticleContent({
        value: 'This is my article content.',
      });

      expect(content.value).toBe('This is my article content.');
      expect(content.toString()).toBe('This is my article content.');
    });

    it('should create content with multiple paragraphs', () => {
      const multiParagraph =
        'First paragraph.\n\nSecond paragraph with more text.';
      const content = new ArticleContent({ value: multiParagraph });

      expect(content.value).toBe(multiParagraph);
    });
  });

  describe('validation', () => {
    it('should throw error when content is empty', () => {
      expect(() => new ArticleContent({ value: '' })).toThrow(
        'Content cannot be empty',
      );
    });

    it('should throw error when content is null or undefined', () => {
      expect(() => new ArticleContent({ value: null as any })).toThrow(
        'Content cannot be empty',
      );
      expect(() => new ArticleContent({ value: undefined as any })).toThrow(
        'Content cannot be empty',
      );
    });

    it('should throw error when content is only whitespace', () => {
      expect(() => new ArticleContent({ value: '   ' })).toThrow(
        'Content cannot be empty',
      );
      expect(() => new ArticleContent({ value: '\n\n\t\t' })).toThrow(
        'Content cannot be empty',
      );
    });
  });

  describe('utility methods', () => {
    it('should count words correctly', () => {
      const content = new ArticleContent({
        value: 'This is a test article content.',
      });

      expect(content.getWordCount()).toBe(6);
    });

    it('should count words correctly with multiple spaces', () => {
      const content = new ArticleContent({ value: 'This   is    a   test.' });

      expect(content.getWordCount()).toBe(4);
    });

    it('should count characters correctly', () => {
      const content = new ArticleContent({ value: 'Hello World!' });

      expect(content.getCharacterCount()).toBe(12);
    });

    it('should handle single word', () => {
      const content = new ArticleContent({ value: 'Hello' });

      expect(content.getWordCount()).toBe(1);
      expect(content.getCharacterCount()).toBe(5);
    });
  });

  describe('equality', () => {
    it('should return true for same content values', () => {
      const content1 = new ArticleContent({ value: 'Same content' });
      const content2 = new ArticleContent({ value: 'Same content' });

      expect(content1.equals(content2)).toBe(true);
    });

    it('should return false for different content values', () => {
      const content1 = new ArticleContent({ value: 'Content 1' });
      const content2 = new ArticleContent({ value: 'Content 2' });

      expect(content1.equals(content2)).toBe(false);
    });
  });
});
