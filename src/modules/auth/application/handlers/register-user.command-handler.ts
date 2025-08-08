import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { RegisterUserCommand } from '../commands';
import { UserRepository } from '../../domain/repositories/user.repository';
import { OtpRepository } from '../../domain/repositories/otp.repository';
import { OtpService } from '../services/otp.service';
import { User } from '../../domain/entities/user.entity';
import { Otp } from '../../domain/entities/otp.entity';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';
import { UserRole } from '../../domain/value-objects/user-role.value-object';
import { 
  UserAlreadyExistsException, 
  UserValidationException 
} from '../../domain/exceptions/user.exceptions';

@Injectable()
@CommandHandler(RegisterUserCommand)
export class RegisterUserCommandHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly otpService: OtpService,
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
        throw new UserValidationException(validationErrors.join(', '));
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email!.toString());
      if (existingUser) {
        throw new UserAlreadyExistsException(email!.toString());
      }

      // Create user
      const user = User.create(email!, password!, new UserRole('user'));
      const savedUser = await this.userRepository.save(user);

      // Generate and save OTP
      const otpCode = this.otpService.generateOtpCode();
      const otp = Otp.create(savedUser.id, otpCode, 10);
      await this.otpRepository.save(otp);

      // TODO: Send OTP via email service
      this.otpService.logOtp(savedUser.email.toString(), otpCode);

      return {
        userId: savedUser.id,
        email: savedUser.email.toString(),
      };
    } catch (error) {
      // Re-throw domain exceptions as-is, others as generic errors
      if (error instanceof UserAlreadyExistsException || 
          error instanceof UserValidationException) {
        throw error;
      }
      throw error;
    }
  }
}
