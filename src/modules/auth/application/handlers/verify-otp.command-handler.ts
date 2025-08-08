import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VerifyOtpCommand } from '../commands';
import { UserRepository } from '../../domain/repositories/user.repository';
import { OtpRepository } from '../../domain/repositories/otp.repository';

interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
  };
  accessToken: string;
}

@Injectable()
@CommandHandler(VerifyOtpCommand)
export class VerifyOtpCommandHandler implements ICommandHandler<VerifyOtpCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: VerifyOtpCommand): Promise<AuthResponse> {
    try {
      // Find user
      const user = await this.userRepository.findById(command.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Find and validate OTP
      const otp = await this.otpRepository.findByUserIdAndCode(
        command.userId,
        command.code,
      );

      if (!otp || !otp.isValid()) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      // Mark OTP as used
      const usedOtp = otp.markAsUsed();
      await this.otpRepository.save(usedOtp);

      // Verify user email
      const verifiedUser = user.verifyEmail();
      const savedUser = await this.userRepository.save(verifiedUser);

      // Generate JWT tokens
      const payload = {
        sub: savedUser.id,
        email: savedUser.email.toString(),
        role: savedUser.role.toString(),
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        user: {
          id: savedUser.id,
          email: savedUser.email.toString(),
          role: savedUser.role.toString(),
          isEmailVerified: savedUser.isEmailVerified,
        },
        accessToken,
      };
    } catch (error) {
      throw error;
    }
  }
}
