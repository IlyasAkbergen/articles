import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import {
  CreateArticleOutputPort,
  UpdateArticleOutputPort,
  DeleteArticleOutputPort,
  GetArticleOutputPort,
  GetAllArticlesOutputPort,
  PublishArticleOutputPort,
} from '../../application/ports/output.ports';
import { Article } from '../../domain/entities/article.entity';
import { PaginationResult } from '../../domain/interfaces/pagination.interface';
import {
  ArticleResponseDto,
  ArticleListResponseDto,
  ErrorResponseDto,
  SuccessResponseDto,
} from '../dtos/response.dtos';
import { PaginatedArticlesResponseDto, PaginationMetaDto } from '../dtos/pagination.dtos';

abstract class BaseRestPresenter {
  protected response: Response;

  setResponse(response: Response): void {
    this.response = response;
  }

  protected ensureResponse(): void {
    if (!this.response) {
      console.error('Response object not set on presenter. This indicates an architectural issue where the presenter instance is not properly shared between controller and handler.');
      throw new Error('Response object not set on presenter. Ensure setResponse() is called before using the presenter.');
    }
  }

  protected sendResponse(statusCode: number, data: any): void {
    this.ensureResponse();
    this.response.status(statusCode).json(data);
  }

  protected mapToResponseDto(article: Article): ArticleResponseDto {
    return {
      id: article.id,
      title: article.title.toString(),
      content: article.content.toString(),
      authorId: article.author.id,
      authorName: article.author.fullName.getFullName(),
      isPublished: article.isPublished,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
      wordCount: article.content.getWordCount(),
    };
  }
}

@Injectable()
export class CreateArticleRestPresenter extends BaseRestPresenter implements CreateArticleOutputPort {
  async presentSuccess(article: Article): Promise<void> {
    const responseDto = this.mapToResponseDto(article);
    this.sendResponse(201, responseDto);
  }

  async presentValidationError(errors: string[]): Promise<void> {
    const errorResponse: ErrorResponseDto = {
      message: 'Validation failed',
      errors,
    };
    this.sendResponse(400, errorResponse);
  }

  async presentNotFoundError(message: string): Promise<void> {
    const errorResponse: ErrorResponseDto = { message };
    this.sendResponse(404, errorResponse);
  }

  async presentServerError(message: string): Promise<void> {
    const errorResponse: ErrorResponseDto = { message };
    this.sendResponse(500, errorResponse);
  }
}

@Injectable()
export class UpdateArticleRestPresenter extends BaseRestPresenter implements UpdateArticleOutputPort {
  async presentSuccess(article: Article): Promise<void> {
    const responseDto = this.mapToResponseDto(article);
    this.sendResponse(200, responseDto);
  }

  async presentValidationError(errors: string[]): Promise<void> {
    const errorResponse: ErrorResponseDto = {
      message: 'Validation failed',
      errors,
    };
    this.sendResponse(400, errorResponse);
  }

  async presentNotFoundError(message: string): Promise<void> {
    const errorResponse: ErrorResponseDto = { message };
    this.sendResponse(404, errorResponse);
  }

  async presentServerError(message: string): Promise<void> {
    const errorResponse: ErrorResponseDto = { message };
    this.sendResponse(500, errorResponse);
  }
}

@Injectable()
export class DeleteArticleRestPresenter extends BaseRestPresenter implements DeleteArticleOutputPort {
  async presentSuccess(): Promise<void> {
    const successResponse: SuccessResponseDto = {
      message: 'Article deleted successfully',
    };
    this.sendResponse(200, successResponse);
  }

  async presentNotFoundError(message: string): Promise<void> {
    const errorResponse: ErrorResponseDto = { message };
    this.sendResponse(404, errorResponse);
  }

  async presentServerError(message: string): Promise<void> {
    const errorResponse: ErrorResponseDto = { message };
    this.sendResponse(500, errorResponse);
  }
}

@Injectable()
export class GetArticleRestPresenter extends BaseRestPresenter implements GetArticleOutputPort {
  async presentSuccess(article: Article): Promise<void> {
    const responseDto = this.mapToResponseDto(article);
    this.sendResponse(200, responseDto);
  }

  async presentNotFoundError(message: string): Promise<void> {
    const errorResponse: ErrorResponseDto = { message };
    this.sendResponse(404, errorResponse);
  }

  async presentServerError(message: string): Promise<void> {
    const errorResponse: ErrorResponseDto = { message };
    this.sendResponse(500, errorResponse);
  }
}

@Injectable()
export class GetAllArticlesRestPresenter extends BaseRestPresenter implements GetAllArticlesOutputPort {
  async presentSuccess(articles: Article[]): Promise<void> {
    const responseDto: ArticleListResponseDto = {
      articles: articles.map((article) => this.mapToResponseDto(article)),
      total: articles.length,
    };
    this.sendResponse(200, responseDto);
  }

  async presentSuccessPaginated(result: PaginationResult<Article>): Promise<void> {
    const meta = new PaginationMetaDto(result.page, result.limit, result.total);
    const responseDto = new PaginatedArticlesResponseDto(
      result.data.map((article) => this.mapToResponseDto(article)),
      meta,
    );
    this.sendResponse(200, responseDto);
  }

  async presentServerError(message: string): Promise<void> {
    const errorResponse: ErrorResponseDto = { message };
    this.sendResponse(500, errorResponse);
  }
}

@Injectable()
export class PublishArticleRestPresenter extends BaseRestPresenter implements PublishArticleOutputPort {
  async presentSuccess(article: Article): Promise<void> {
    const responseDto = this.mapToResponseDto(article);
    this.sendResponse(200, responseDto);
  }

  async presentValidationError(errors: string[]): Promise<void> {
    const errorResponse: ErrorResponseDto = {
      message: 'Validation failed',
      errors,
    };
    this.sendResponse(400, errorResponse);
  }

  async presentNotFoundError(message: string): Promise<void> {
    const errorResponse: ErrorResponseDto = { message };
    this.sendResponse(404, errorResponse);
  }

  async presentServerError(message: string): Promise<void> {
    const errorResponse: ErrorResponseDto = { message };
    this.sendResponse(500, errorResponse);
  }
}
