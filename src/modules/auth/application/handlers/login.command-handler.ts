import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginCommand } from '../commands';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.value-object';

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
@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResponse> {
    try {
      const validationErrors: string[] = [];

      let email: Email;

      try {
        email = new Email(command.email);
      } catch (error) {
        validationErrors.push(error.message);
      }

      if (!command.password) {
        validationErrors.push('Password is required');
      }

      if (validationErrors.length > 0) {
        throw new BadRequestException(validationErrors.join(', '));
      }

      const user = await this.userRepository.findByEmail(email!.toString());
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await user.password.compare(command.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isEmailVerified) {
        throw new UnauthorizedException('Please verify your email before logging in');
      }

      const payload = {
        sub: user.id,
        email: user.email.toString(),
        role: user.role.toString(),
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        user: {
          id: user.id,
          email: user.email.toString(),
          role: user.role.toString(),
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
      };
    } catch (error) {
      throw error;
    }
  }
}
