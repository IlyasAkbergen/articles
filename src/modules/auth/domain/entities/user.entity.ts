import { randomUUID } from 'crypto';
import { Email } from '../value-objects/email.value-object';
import { Password } from '../value-objects/password.value-object';
import { UserRole } from '../value-objects/user-role.value-object';

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly password: Password,
    public readonly role: UserRole,
    public readonly isEmailVerified: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    email: Email,
    password: Password,
    role: UserRole = new UserRole('user'),
  ): User {
    const now = new Date();

    return new User(
      randomUUID(),
      email,
      password,
      role,
      false,
      now,
      now,
    );
  }

  static reconstruct(
    id: string,
    email: Email,
    password: Password,
    role: UserRole,
    isEmailVerified: boolean,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(
      id,
      email,
      password,
      role,
      isEmailVerified,
      createdAt,
      updatedAt,
    );
  }

  verifyEmail(): User {
    return new User(
      this.id,
      this.email,
      this.password,
      this.role,
      true,
      this.createdAt,
      new Date(),
    );
  }

  updatePassword(newPassword: Password): User {
    return new User(
      this.id,
      this.email,
      newPassword,
      this.role,
      this.isEmailVerified,
      this.createdAt,
      new Date(),
    );
  }
}
