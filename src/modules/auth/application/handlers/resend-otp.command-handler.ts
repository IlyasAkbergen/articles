import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ResendOtpCommand } from '../commands';
import { UserRepository } from '../../domain/repositories/user.repository';
import { OtpRepository } from '../../domain/repositories/otp.repository';
import { Otp } from '../../domain/entities/otp.entity';

@Injectable()
@CommandHandler(ResendOtpCommand)
export class ResendOtpCommandHandler implements ICommandHandler<ResendOtpCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
  ) {}

  async execute(command: ResendOtpCommand): Promise<void> {
    try {
      // Find user
      const user = await this.userRepository.findById(command.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user is already verified
      if (user.isEmailVerified) {
        throw new NotFoundException('User email is already verified');
      }

      // Generate and save new OTP
      const otpCode = this.generateOtpCode();
      const otp = Otp.create(user.id, otpCode, 10);
      await this.otpRepository.save(otp);

      // TODO: Send OTP via email service
      console.log(`New OTP for user ${user.email}: ${otpCode}`);
    } catch (error) {
      throw error;
    }
  }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
