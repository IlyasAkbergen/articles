import { Email } from './email.value-object';

describe('Email Value Object', () => {
  describe('creating a valid email', () => {
    it('should create email with valid value', () => {
      const email = new Email('iliyas.akbergen@gmail.com');

      expect(email.value).toBe('iliyas.akbergen@gmail.com');
      expect(email.toString()).toBe('iliyas.akbergen@gmail.com');
    });

    it('should create email with complex valid format', () => {
      const email = new Email('user.name+tag@domain.co.uk');

      expect(email.value).toBe('user.name+tag@domain.co.uk');
    });
  });

  describe('validation', () => {
    it('should throw error when email is empty', () => {
      expect(() => new Email('')).toThrow('Email cannot be empty');
    });

    it('should throw error when email is null or undefined', () => {
      expect(() => new Email(null as any)).toThrow(
        'Email cannot be empty',
      );
      expect(() => new Email(undefined as any)).toThrow(
        'Email cannot be empty',
      );
    });

    it('should throw error when email is only whitespace', () => {
      expect(() => new Email('   ')).toThrow(
        'Email cannot be empty',
      );
    });

    it('should throw error when email format is invalid', () => {
      expect(() => new Email('invalid-email')).toThrow(
        'Email format is invalid',
      );
      expect(() => new Email('test@')).toThrow(
        'Email format is invalid',
      );
      expect(() => new Email('@example.com')).toThrow(
        'Email format is invalid',
      );
      expect(() => new Email('test.example.com')).toThrow(
        'Email format is invalid',
      );
    });
  });

  describe('equality', () => {
    it('should return true for same email values', () => {
      const email1 = new Email('iliyas.akbergen@gmail.com');
      const email2 = new Email('iliyas.akbergen@gmail.com');

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different email values', () => {
      const email1 = new Email('iliyas.akbergen@gmail.com');
      const email2 = new Email('test2@example.com');

      expect(email1.equals(email2)).toBe(false);
    });
  });
});
