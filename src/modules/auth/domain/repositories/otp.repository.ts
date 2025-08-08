import { Otp } from '../entities/otp.entity';

export abstract class OtpRepository {
  abstract save(otp: Otp): Promise<Otp>;
  abstract findByUserIdAndCode(userId: string, code: string): Promise<Otp | null>;
  abstract findValidByUserId(userId: string): Promise<Otp | null>;
  abstract deleteExpired(): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
