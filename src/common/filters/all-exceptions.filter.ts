import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

@Catch(Error)
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof PrismaClientKnownRequestError) {
      const errorResponse: ErrorResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
        error: exception.name,
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      response.status(HttpStatus.BAD_REQUEST).json(errorResponse);
      return;
    }

    const errorResponse: ErrorResponse = {
      statusCode: (exception as HttpException)?.getStatus() || status,
      message: exception.message || 'Internal Server Error',
      error: exception.name || 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
