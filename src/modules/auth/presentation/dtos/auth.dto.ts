import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'iliyas.akbergen@gmail.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'MySecurePassword123',
    minLength: 8,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  )
  password: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'User ID received during registration',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: '6-digit OTP code sent to user email. In development environment, use 123456',
    example: '123456',
    minLength: 6,
    maxLength: 6,
    pattern: '^[0-9]{6}$',
  })
  @IsString()
  @MinLength(6, { message: 'OTP must be 6 digits' })
  code: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'iliyas.akbergen@gmail.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'MySecurePassword123',
  })
  @IsString()
  password: string;
}

export class ResendOtpDto {
  @ApiProperty({
    description: 'User ID for which to resend OTP. In development environment, the OTP will always be 123456',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsString()
  userId: string;
}
