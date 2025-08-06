export class ArticleResponseDto {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  wordCount: number;
}

export class ArticleListResponseDto {
  articles: ArticleResponseDto[];
  total: number;
}

export class ErrorResponseDto {
  message: string;
  errors?: string[];
}

export class SuccessResponseDto {
  message: string;
}
