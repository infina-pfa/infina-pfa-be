import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

@Catch(Error)
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const logger = new Logger(AllExceptionsFilter.name);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    let errorResponse: ErrorResponse = {
      statusCode:
        exception instanceof HttpException ? exception.getStatus() : status,
      message: exception.message || 'Internal Server Error',
      code: 'internal_server_error',
      error: exception.name || 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exception instanceof PrismaClientKnownRequestError) {
      errorResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
        code: exception.code,
        error: exception.name,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
      status = HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof HttpException) {
      errorResponse = {
        statusCode: exception?.getStatus(),
        message: exception.message,
        error: exception.name,
        code: (exception.getResponse() as Record<string, unknown>)
          ?.code as string,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
      status = exception?.getStatus();
    }

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse() as { message?: string[] };
      errorResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: Array.isArray(response.message)
          ? response.message.join(', ')
          : response.message || 'Bad Request',
        code: 'bad_request',
        error: exception.name,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
      status = HttpStatus.BAD_REQUEST;
    }

    logger.error(
      `[${errorResponse.statusCode}] ${errorResponse.code} \n- MESSAGE: ${errorResponse.message} \n- PATH: ${errorResponse.path} \n- STACK: ${JSON.stringify(exception.stack)}`,
    );

    response.status(status).json(errorResponse);
  }
}
