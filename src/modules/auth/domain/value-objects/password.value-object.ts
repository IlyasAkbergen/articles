import * as bcrypt from 'bcrypt';

export class Password {
  private readonly _value: string;

  constructor(value: string, isHashed: boolean = false) {
    if (!value || value.trim() === '') {
      throw new Error('Password cannot be empty');
    }

    if (!isHashed) {
      if (value.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        throw new Error(
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        );
      }
    }

    this._value = value;
  }

  static async create(plainPassword: string): Promise<Password> {
    const password = new Password(plainPassword, false);
    const hashedValue = await bcrypt.hash(password._value, 12);

    return new Password(hashedValue, true);
  }

  static fromHash(hashedPassword: string): Password {
    return new Password(hashedPassword, true);
  }

  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this._value);
  }

  toString(): string {
    return this._value;
  }
}
