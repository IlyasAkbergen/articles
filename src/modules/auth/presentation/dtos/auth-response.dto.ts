import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'User registered successfully. Please check your email for OTP verification.',
  })
  message: string;

  @ApiProperty({
    description: 'User data',
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'iliyas.akbergen@gmail.com',
      },
    },
  })
  data: {
    userId: string;
    email: string;
  };
}

export class VerifyOtpResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Email verified successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User verification data',
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
      verified: {
        type: 'boolean',
        example: true,
      },
    },
  })
  data: {
    userId: string;
    verified: boolean;
  };
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Login successful',
  })
  message: string;

  @ApiProperty({
    description: 'Authentication data',
    type: 'object',
    properties: {
      accessToken: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
      user: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'iliyas.akbergen@gmail.com',
          },
          role: {
            type: 'string',
            example: 'user',
          },
        },
      },
    },
  })
  data: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
}

export class ResendOtpResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'OTP sent successfully',
  })
  message: string;
}

export class AuthErrorResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid credentials',
  })
  message: string;
}
