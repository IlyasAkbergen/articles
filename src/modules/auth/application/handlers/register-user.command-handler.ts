import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { RegisterUserCommand } from '../commands';
import { UserRepository } from '../../domain/repositories/user.repository';
import { OtpRepository } from '../../domain/repositories/otp.repository';
import { User } from '../../domain/entities/user.entity';
import { Otp } from '../../domain/entities/otp.entity';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';
import { UserRole } from '../../domain/value-objects/user-role.value-object';

@Injectable()
@CommandHandler(RegisterUserCommand)
export class RegisterUserCommandHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<{ userId: string; email: string }> {
    try {
      const validationErrors: string[] = [];

      let email: Email;
      let password: Password;

      try {
        email = new Email(command.email);
      } catch (error) {
        validationErrors.push(error.message);
      }

      try {
        password = await Password.create(command.password);
      } catch (error) {
        validationErrors.push(error.message);
      }

      if (validationErrors.length > 0) {
        throw new BadRequestException(validationErrors.join(', '));
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email!.toString());
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create user
      const user = User.create(email!, password!, new UserRole('user'));
      const savedUser = await this.userRepository.save(user);

      // Generate and save OTP
      const otpCode = this.generateOtpCode();
      const otp = Otp.create(savedUser.id, otpCode, 10);
      await this.otpRepository.save(otp);

      // TODO: Send OTP via email service
      console.log(`OTP for user ${savedUser.email}: ${otpCode}`);

      return {
        userId: savedUser.id,
        email: savedUser.email.toString(),
      };
    } catch (error) {
      throw error;
    }
  }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
