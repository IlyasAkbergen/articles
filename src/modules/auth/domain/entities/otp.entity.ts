import { randomUUID } from 'crypto';

export class Otp {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly code: string,
    public readonly expiresAt: Date,
    public readonly isUsed: boolean,
    public readonly createdAt: Date,
  ) {}

  static create(userId: string, code: string, expirationMinutes: number = 10): Otp {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expirationMinutes * 60 * 1000);

    return new Otp(
      randomUUID(),
      userId,
      code,
      expiresAt,
      false,
      now,
    );
  }

  static reconstruct(
    id: string,
    userId: string,
    code: string,
    expiresAt: Date,
    isUsed: boolean,
    createdAt: Date,
  ): Otp {
    return new Otp(id, userId, code, expiresAt, isUsed, createdAt);
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isUsed && !this.isExpired();
  }

  markAsUsed(): Otp {
    return new Otp(
      this.id,
      this.userId,
      this.code,
      this.expiresAt,
      true,
      this.createdAt,
    );
  }
}
