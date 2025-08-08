import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({
    description: 'First name of the author',
    example: 'Iliyas',
    maxLength: 50,
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'Last name of the author',
    example: 'Akbergen',
    maxLength: 50,
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    description: 'Email address of the author',
    example: 'iliyas.akbergen@gmail.com',
    format: 'email',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
