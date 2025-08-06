import { Author } from './author.entity';
import { FullName } from '../value-objects/full-name.value-object';
import { Email } from '../value-objects/email.value-object';

describe('Author', () => {
  const validFullName = new FullName({ firstName: 'Iliyas', lastName: 'Akbergen' });
  const validEmail = new Email('iliyas.akbergen@gmail.com');

  describe('create', () => {
    it('should create an author with valid data', () => {
      const author = Author.create(validFullName, validEmail);

      expect(author.id).toBeDefined();
      expect(author.fullName).toBe(validFullName);
      expect(author.email).toBe(validEmail);
      expect(author.createdAt).toBeInstanceOf(Date);
      expect(author.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error when email is empty', () => {
      expect(() => new Email('')).toThrow('Email cannot be empty');
    });

    it('should throw error when email format is invalid', () => {
      expect(() => new Email('invalid-email')).toThrow(
        'Email format is invalid',
      );
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct an author from existing data', () => {
      const now = new Date();
      const author = Author.reconstruct(
        'test-id',
        validFullName,
        validEmail,
        now,
        now,
      );

      expect(author.id).toBe('test-id');
      expect(author.fullName).toBe(validFullName);
      expect(author.email).toBe(validEmail);
      expect(author.createdAt).toBe(now);
      expect(author.updatedAt).toBe(now);
    });
  });

  describe('updateFullName', () => {
    it('should return new instance with updated full name and updatedAt', () => {
      const author = Author.create(validFullName, validEmail);

      const originalUpdatedAt = author.updatedAt;
      const newFullName = new FullName({
        firstName: 'Jane',
        lastName: 'Smith',
      });

      const updatedAuthor = author.updateFullName(newFullName);

      expect(updatedAuthor.fullName).toBe(newFullName);
      expect(updatedAuthor.id).toBe(author.id);
      expect(updatedAuthor.email).toBe(author.email);
      expect(updatedAuthor.updatedAt).not.toBe(originalUpdatedAt);
      expect(updatedAuthor).not.toBe(author); // Should be a new instance
    });
  });

  describe('updateEmail', () => {
    it('should return new instance with updated email and updatedAt', () => {
      const author = Author.create(validFullName, validEmail);

      const originalUpdatedAt = author.updatedAt;
      const newEmail = new Email('jane.smith@example.com');

      const updatedAuthor = author.updateEmail(newEmail);

      expect(updatedAuthor.email).toBe(newEmail);
      expect(updatedAuthor.id).toBe(author.id);
      expect(updatedAuthor.fullName).toBe(author.fullName);
      expect(updatedAuthor.updatedAt).not.toBe(originalUpdatedAt);
      expect(updatedAuthor).not.toBe(author); // Should be a new instance
    });

    it('should throw error when new email is invalid', () => {
      const author = Author.create(validFullName, validEmail);

      expect(() => new Email('invalid-email')).toThrow(
        'Email format is invalid',
      );
    });
  });
});
