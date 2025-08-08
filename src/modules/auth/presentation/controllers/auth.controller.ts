import {
  Controller,
  Post,
  Body,
  HttpStatus,
  ValidationPipe,
  HttpException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  RegisterUserCommand,
  VerifyOtpCommand,
  LoginCommand,
  ResendOtpCommand,
} from '../../application/commands';
import {
  RegisterUserDto,
  VerifyOtpDto,
  LoginDto,
  ResendOtpDto,
} from '../dtos/auth.dto';
import { Public } from '../../infrastructure/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Post('register')
  async register(
    @Body(new ValidationPipe({ transform: true })) registerDto: RegisterUserDto,
  ) {
    try {
      const command = new RegisterUserCommand(registerDto.email, registerDto.password);
      const result = await this.commandBus.execute(command);
      
      return {
        success: true,
        message: 'User registered successfully. Please check your email for OTP verification.',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(
    @Body(new ValidationPipe({ transform: true })) verifyOtpDto: VerifyOtpDto,
  ) {
    try {
      const command = new VerifyOtpCommand(verifyOtpDto.userId, verifyOtpDto.code);
      const result = await this.commandBus.execute(command);
      
      return {
        success: true,
        message: 'Email verified successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Public()
  @Post('login')
  async login(
    @Body(new ValidationPipe({ transform: true })) loginDto: LoginDto,
  ) {
    try {
      const command = new LoginCommand(loginDto.email, loginDto.password);
      const result = await this.commandBus.execute(command);
      
      return {
        success: true,
        message: 'Login successful',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Public()
  @Post('resend-otp')
  async resendOtp(
    @Body(new ValidationPipe({ transform: true })) resendOtpDto: ResendOtpDto,
  ) {
    try {
      const command = new ResendOtpCommand(resendOtpDto.userId);
      await this.commandBus.execute(command);
      
      return {
        success: true,
        message: 'OTP sent successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
