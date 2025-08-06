import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateArticleRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  authorId: string;
}

export class UpdateArticleRequestDto {
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsString()
  content?: string;
}

export class PublishArticleRequestDto {
}
