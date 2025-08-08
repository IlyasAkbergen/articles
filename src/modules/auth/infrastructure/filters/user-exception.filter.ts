import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  UserAlreadyExistsException,
  UserNotFoundException,
  UserValidationException,
  UserNotVerifiedException,
  InvalidCredentialsException,
  UserDomainException,
} from '../../domain/exceptions/user.exceptions';

@Catch(UserDomainException)
export class UserExceptionFilter implements ExceptionFilter {
  catch(exception: UserDomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: HttpStatus;
    let message: string;

    switch (exception.constructor) {
      case UserAlreadyExistsException:
        status = HttpStatus.CONFLICT;
        message = exception.message;
        break;
      case UserNotFoundException:
        status = HttpStatus.NOT_FOUND;
        message = exception.message;
        break;
      case UserValidationException:
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
        break;
      case UserNotVerifiedException:
        status = HttpStatus.FORBIDDEN;
        message = exception.message;
        break;
      case InvalidCredentialsException:
        status = HttpStatus.UNAUTHORIZED;
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
