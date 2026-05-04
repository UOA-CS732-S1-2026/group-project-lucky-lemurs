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

const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
};

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
    return DEFAULT_ERROR_MESSAGES[status] ?? 'Internal Server Error';
  }
}
