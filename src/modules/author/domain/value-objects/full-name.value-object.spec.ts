import { FullName } from './full-name.value-object';

describe('FullName', () => {
  describe('constructor', () => {
    it('should create a FullName with valid firstName and lastName', () => {
      const fullName = new FullName({
        firstName: 'Iliyas',
        lastName: 'Akbergen',
      });

      expect(fullName.getFirstName()).toBe('Iliyas');
      expect(fullName.getLastName()).toBe('Akbergen');
      expect(fullName.getFullName()).toBe('Iliyas Akbergen');
    });

    it('should trim whitespace from names', () => {
      const fullName = new FullName({
        firstName: '  Iliyas  ',
        lastName: '  Akbergen  ',
      });

      expect(fullName.getFirstName()).toBe('Iliyas');
      expect(fullName.getLastName()).toBe('Akbergen');
    });

    it('should throw error when firstName is empty', () => {
      expect(
        () =>
          new FullName({
            firstName: '',
            lastName: 'Akbergen',
          }),
      ).toThrow('First name cannot be empty');
    });

    it('should throw error when lastName is empty', () => {
      expect(
        () =>
          new FullName({
            firstName: 'Iliyas',
            lastName: '',
          }),
      ).toThrow('Last name cannot be empty');
    });

    it('should throw error when firstName exceeds 50 characters', () => {
      const longName = 'a'.repeat(51);
      expect(
        () =>
          new FullName({
            firstName: longName,
            lastName: 'Akbergen',
          }),
      ).toThrow('First name cannot exceed 50 characters');
    });

    it('should throw error when lastName exceeds 50 characters', () => {
      const longName = 'a'.repeat(51);
      expect(
        () =>
          new FullName({
            firstName: 'Iliyas',
            lastName: longName,
          }),
      ).toThrow('Last name cannot exceed 50 characters');
    });
  });

  describe('equals', () => {
    it('should return true for equal FullNames', () => {
      const fullName1 = new FullName({ firstName: 'Iliyas', lastName: 'Akbergen' });
      const fullName2 = new FullName({ firstName: 'Iliyas', lastName: 'Akbergen' });

      expect(fullName1.equals(fullName2)).toBe(true);
    });

    it('should return false for different FullNames', () => {
      const fullName1 = new FullName({ firstName: 'Iliyas', lastName: 'Akbergen' });
      const fullName2 = new FullName({ firstName: 'Jane', lastName: 'Akbergen' });

      expect(fullName1.equals(fullName2)).toBe(false);
    });
  });
});
