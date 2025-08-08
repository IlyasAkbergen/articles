import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  AuthorAlreadyExistsException,
  AuthorNotFoundException,
  AuthorValidationException,
  AuthorDomainException,
} from '../../domain/exceptions/author.exceptions';

@Catch(AuthorDomainException)
export class AuthorExceptionFilter implements ExceptionFilter {
  catch(exception: AuthorDomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: HttpStatus;
    let message: string;

    switch (exception.constructor) {
      case AuthorAlreadyExistsException:
        status = HttpStatus.CONFLICT;
        message = exception.message;
        break;
      case AuthorNotFoundException:
        status = HttpStatus.NOT_FOUND;
        message = exception.message;
        break;
      case AuthorValidationException:
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
