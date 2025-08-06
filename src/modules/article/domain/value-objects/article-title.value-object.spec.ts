import { ArticleTitle } from './article-title.value-object';

describe('ArticleTitle Value Object', () => {
  describe('creating a valid title', () => {
    it('should create title with valid value', () => {
      const title = new ArticleTitle({ value: 'My Test Article' });

      expect(title.value).toBe('My Test Article');
      expect(title.toString()).toBe('My Test Article');
    });

    it('should create title with maximum allowed length', () => {
      const longTitle = 'a'.repeat(255);
      const title = new ArticleTitle({ value: longTitle });

      expect(title.value).toBe(longTitle);
      expect(title.value.length).toBe(255);
    });
  });

  describe('validation', () => {
    it('should throw error when title is empty', () => {
      expect(() => new ArticleTitle({ value: '' })).toThrow(
        'Title cannot be empty',
      );
    });

    it('should throw error when title is null or undefined', () => {
      expect(() => new ArticleTitle({ value: null as any })).toThrow(
        'Title cannot be empty',
      );
      expect(() => new ArticleTitle({ value: undefined as any })).toThrow(
        'Title cannot be empty',
      );
    });

    it('should throw error when title is only whitespace', () => {
      expect(() => new ArticleTitle({ value: '   ' })).toThrow(
        'Title cannot be empty',
      );
    });

    it('should throw error when title exceeds maximum length', () => {
      const tooLongTitle = 'a'.repeat(256);
      expect(() => new ArticleTitle({ value: tooLongTitle })).toThrow(
        'Title cannot exceed 255 characters',
      );
    });
  });

  describe('equality', () => {
    it('should return true for same title values', () => {
      const title1 = new ArticleTitle({ value: 'Test Title' });
      const title2 = new ArticleTitle({ value: 'Test Title' });

      expect(title1.equals(title2)).toBe(true);
    });

    it('should return false for different title values', () => {
      const title1 = new ArticleTitle({ value: 'Title 1' });
      const title2 = new ArticleTitle({ value: 'Title 2' });

      expect(title1.equals(title2)).toBe(false);
    });
  });
});
