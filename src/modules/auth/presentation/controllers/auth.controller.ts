import {
  Controller,
  Post,
  Body,
  HttpStatus,
  ValidationPipe,
  HttpException,
  Inject,
  UseFilters,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
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
import {
  RegisterResponseDto,
  VerifyOtpResponseDto,
  LoginResponseDto,
  ResendOtpResponseDto,
  AuthErrorResponseDto,
} from '../dtos/auth-response.dto';
import { Public } from '../../infrastructure/decorators/public.decorator';
import { UserExceptionFilter } from '../../infrastructure/filters/user-exception.filter';

@ApiTags('Authentication')
@Controller('auth')
@UseFilters(UserExceptionFilter)
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account and sends an OTP to the provided email for verification. In development environment, use OTP: 123456',
  })
  @ApiBody({
    type: RegisterUserDto,
    description: 'User registration data',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. OTP sent to email. In development, use 123456 as OTP.',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
    schema: {
      example: {
        success: false,
        statusCode: 400,
        message: 'Email format is invalid, Password must be at least 8 characters long',
        timestamp: '2025-01-01T00:00:00.000Z',
        path: '/auth/register'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - user with this email already exists',
    schema: {
      example: {
        success: false,
        statusCode: 409,
        message: "User with email 'test@example.com' already exists",
        timestamp: '2025-01-01T00:00:00.000Z',
        path: '/auth/register'
      }
    }
  })
  async register(
    @Body(new ValidationPipe({ transform: true })) registerDto: RegisterUserDto,
  ) {
    const command = new RegisterUserCommand(registerDto.email, registerDto.password);
    const result = await this.commandBus.execute(command);
    
    const devHint = this.configService.get('NODE_ENV') === 'development' ? ' (Dev: Use OTP 123456)' : '';
    
    return {
      success: true,
      message: `User registered successfully. Please check your email for OTP verification.${devHint}`,
      data: result,
    };
  }

  @Public()
  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify OTP',
    description: 'Verifies the OTP sent to user email during registration. In development environment, use 123456 as the OTP code.',
  })
  @ApiBody({
    type: VerifyOtpDto,
    description: 'OTP verification data',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: VerifyOtpResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid or expired OTP',
    type: AuthErrorResponseDto,
  })
  async verifyOtp(
    @Body(new ValidationPipe({ transform: true })) verifyOtpDto: VerifyOtpDto,
  ) {
    const command = new VerifyOtpCommand(verifyOtpDto.userId, verifyOtpDto.code);
    const result = await this.commandBus.execute(command);
    
    return {
      success: true,
      message: 'Email verified successfully',
      data: result,
    };
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates a user and returns a JWT access token.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
    type: AuthErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - email not verified',
    type: AuthErrorResponseDto,
  })
  async login(
    @Body(new ValidationPipe({ transform: true })) loginDto: LoginDto,
  ) {
    const command = new LoginCommand(loginDto.email, loginDto.password);
    const result = await this.commandBus.execute(command);
    
    return {
      success: true,
      message: 'Login successful',
      data: result,
    };
  }

  @Public()
  @Post('resend-otp')
  @ApiOperation({
    summary: 'Resend OTP',
    description: 'Resends the OTP to the user email for verification. In development environment, the OTP will always be 123456.',
  })
  @ApiBody({
    type: ResendOtpDto,
    description: 'User ID for OTP resend',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully. In development, use 123456 as OTP.',
    type: ResendOtpResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - user not found or already verified',
    type: AuthErrorResponseDto,
  })
  async resendOtp(
    @Body(new ValidationPipe({ transform: true })) resendOtpDto: ResendOtpDto,
  ) {
    const command = new ResendOtpCommand(resendOtpDto.userId);
    await this.commandBus.execute(command);
    
    const devHint = this.configService.get('NODE_ENV') === 'development' ? ' (Dev: Use OTP 123456)' : '';
    
    return {
      success: true,
      message: `OTP sent successfully${devHint}`,
    };
  }
}
