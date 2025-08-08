import { ApiProperty } from '@nestjs/swagger';

export class AuthorResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the author',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'First name of the author',
    example: 'Iliyas',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the author',
    example: 'Akbergen',
  })
  lastName: string;

  @ApiProperty({
    description: 'Full name of the author',
    example: 'Iliyas Akbergen',
  })
  fullName: string;

  @ApiProperty({
    description: 'Email address of the author',
    example: 'iliyas.akbergen@gmail.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Date when the author was created',
    example: '2025-08-08T10:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the author was last updated',
    example: '2025-08-08T12:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
