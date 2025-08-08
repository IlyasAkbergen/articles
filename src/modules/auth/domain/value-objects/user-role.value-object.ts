export type UserRoleType = 'admin' | 'user';

export class UserRole {
  private readonly _value: UserRoleType;

  constructor(value: UserRoleType) {
    if (!['admin', 'user'].includes(value)) {
      throw new Error('Invalid user role');
    }

    this._value = value;
  }

  get value(): UserRoleType {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  isAdmin(): boolean {
    return this._value === 'admin';
  }

  isUser(): boolean {
    return this._value === 'user';
  }

  equals(other: UserRole): boolean {
    return this._value === other._value;
  }
}
