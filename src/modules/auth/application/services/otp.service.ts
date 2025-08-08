import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  constructor(private readonly configService: ConfigService) {}

  generateOtpCode(): string {
    const nodeEnv = this.configService.get('NODE_ENV');
    
    if (nodeEnv === 'development') {
      return '123456';
    }

    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  getDevOtpHint(): string {
    const nodeEnv = this.configService.get('NODE_ENV');
    return nodeEnv === 'development' ? ' (Dev: Use OTP 123456)' : '';
  }

  logOtp(email: string, otpCode: string): void {
    const nodeEnv = this.configService.get('NODE_ENV');
    
    if (nodeEnv === 'development') {
      console.log(`🔐 [DEV] OTP for user ${email}: ${otpCode} (Static OTP for development)`);
    } else {
      console.log(`OTP for user ${email}: ${otpCode}`);
    }
  }
}
