import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ArticleAlreadyExistsException,
  ArticleNotFoundException,
  ArticleValidationException,
  ArticleAlreadyPublishedException,
  ArticleAlreadyUnpublishedException,
  ArticleDomainException,
} from '../../domain/exceptions/article.exceptions';

@Catch(ArticleDomainException)
export class ArticleExceptionFilter implements ExceptionFilter {
  catch(exception: ArticleDomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: HttpStatus;
    let message: string;

    switch (exception.constructor) {
      case ArticleAlreadyExistsException:
        status = HttpStatus.CONFLICT;
        message = exception.message;
        break;
      case ArticleNotFoundException:
        status = HttpStatus.NOT_FOUND;
        message = exception.message;
        break;
      case ArticleValidationException:
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
        break;
      case ArticleAlreadyPublishedException:
      case ArticleAlreadyUnpublishedException:
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Internal server error';
        break;
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    };

    response.status(status).json(errorResponse);
  }
}
