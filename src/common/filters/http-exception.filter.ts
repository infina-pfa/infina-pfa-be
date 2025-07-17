import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message: exception.message || 'Internal Server Error',
      error: exception.name || 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Try to get the response exception object if available
    try {
      const exceptionResponse = exception.getResponse() as Record<
        string,
        unknown
      >;
      if (typeof exceptionResponse === 'object') {
        errorResponse.message =
          (exceptionResponse.message as string | string[]) || exception.message;
        errorResponse.error =
          (exceptionResponse.error as string) || exception.name;
      }
    } catch (err) {
      // If we can't get a structured response, use the exception message
      this.logger.error('Error parsing exception response', err);
    }

    this.logger.error(
      `${request.method} ${request.url} ${status}: ${JSON.stringify(errorResponse.message)}`,
    );

    response.status(status).json(errorResponse);
  }
}
