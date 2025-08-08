import { ApiProperty } from '@nestjs/swagger';

export class ArticleResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the article',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the article',
    example: 'Understanding Clean Architecture in NestJS',
  })
  title: string;

  @ApiProperty({
    description: 'Content of the article in markdown format',
    example: 'This article explores the principles of Clean Architecture and how to implement them in a NestJS application...',
  })
  content: string;

  @ApiProperty({
    description: 'Unique identifier of the author',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  authorId: string;

  @ApiProperty({
    description: 'Full name of the author',
    example: 'Iliyas Akbergen',
  })
  authorName: string;

  @ApiProperty({
    description: 'Whether the article is published',
    example: true,
  })
  isPublished: boolean;

  @ApiProperty({
    description: 'Date when the article was created',
    example: '2025-08-08T10:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the article was last updated',
    example: '2025-08-08T12:00:00Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Date when the article was published',
    example: '2025-08-08T12:00:00Z',
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  publishedAt: Date | null;

  @ApiProperty({
    description: 'Number of words in the article content',
    example: 150,
    minimum: 0,
  })
  wordCount: number;
}

export class ArticleListResponseDto {
  @ApiProperty({
    description: 'List of articles',
    type: [ArticleResponseDto],
  })
  articles: ArticleResponseDto[];

  @ApiProperty({
    description: 'Total number of articles',
    example: 25,
    minimum: 0,
  })
  total: number;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Article not found',
  })
  message: string;

  @ApiProperty({
    description: 'Detailed error messages',
    example: ['Title is required', 'Content cannot be empty'],
    required: false,
    type: [String],
  })
  errors?: string[];
}

export class SuccessResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Article created successfully',
  })
  message: string;
}
