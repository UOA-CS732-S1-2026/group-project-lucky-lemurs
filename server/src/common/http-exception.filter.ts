import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode?: number;
  error?: string;
  message?: string | string[];
  field?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const body = this.normalizeError(status, exceptionResponse);

    response.status(status).json(body);
  }

  private normalizeError(
    status: number,
    exceptionResponse: string | object | null,
  ) {
    if (typeof exceptionResponse === 'string') {
      return {
        statusCode: status,
        error: this.getDefaultError(status),
        message: exceptionResponse,
      };
    }

    const response = (exceptionResponse ?? {}) as ErrorResponse;
    const message = Array.isArray(response.message)
      ? response.message[0]
      : response.message;

    return {
      statusCode: response.statusCode ?? status,
      error: response.error ?? this.getDefaultError(status),
      message: message ?? this.getDefaultError(status),
      ...(response.field ? { field: response.field } : {}),
    };
  }

  private getDefaultError(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      default:
        return 'Internal Server Error';
    }
  }
}
