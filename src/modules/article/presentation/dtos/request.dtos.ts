import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleRequestDto {
  @ApiProperty({
    description: 'The title of the article',
    example: 'Understanding Clean Architecture in NestJS',
    maxLength: 255,
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'The content of the article in markdown format',
    example: 'This article explores the principles of Clean Architecture and how to implement them in a NestJS application...',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'The unique identifier of the author',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  authorId: string;
}

export class UpdateArticleRequestDto {
  @ApiProperty({
    description: 'The updated title of the article',
    example: 'Understanding Clean Architecture in NestJS - Updated',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    description: 'The updated content of the article in markdown format',
    example: 'This updated article explores the principles of Clean Architecture...',
    required: false,
  })
  @IsString()
  content?: string;
}

export class PublishArticleRequestDto {
  @ApiProperty({
    description: 'Optional message for publishing the article',
    example: 'Article is ready for publication',
    required: false,
  })
  message?: string;
}
