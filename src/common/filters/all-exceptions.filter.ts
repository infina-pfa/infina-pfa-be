import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';
import { LoggerService } from '../logger/logger.service';
import { User } from '@supabase/supabase-js';

interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  correlationId?: string;
}

// Extend Express Request to include user
interface RequestWithUser extends Request {
  user?: User;
}

@Catch(Error)
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithUser>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    // Get correlation ID from headers or generate one
    const correlationId =
      (request.headers['x-correlation-id'] as string) ||
      (request.headers['x-request-id'] as string);

    // Extract user information
    const userId = request.user?.id;

    let errorResponse: ErrorResponse = {
      statusCode:
        exception instanceof HttpException ? exception.getStatus() : status,
      message: exception.message || 'Internal Server Error',
      code: 'internal_server_error',
      error: exception.name || 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
    };

    // Handle Prisma errors
    if (exception instanceof PrismaClientKnownRequestError) {
      errorResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
        code: 'bad_request',
        error: 'Bad Request',
        timestamp: new Date().toISOString(),
        path: request.url,
        correlationId,
      };
      status = HttpStatus.BAD_REQUEST;
      this.logger.logStructured('error', 'Prisma Error', {
        type: 'exception',
        message: this.getPrismaErrorMessage(exception),
        error: exception.name,
        correlationId,
      });
    }

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      errorResponse = {
        statusCode: exception?.getStatus(),
        message: exception.message,
        error: exception.name,
        code:
          ((exception.getResponse() as Record<string, unknown>)
            ?.code as string) || 'http_exception',
        timestamp: new Date().toISOString(),
        path: request.url,
        correlationId,
      };
      status = exception?.getStatus();
    }

    // Handle BadRequest exceptions
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
        correlationId,
      };
      status = HttpStatus.BAD_REQUEST;
    }

    // Log structured error
    this.logger.logStructured('error', `Exception caught: ${exception.name}`, {
      type: 'exception',
      statusCode: errorResponse.statusCode,
      code: errorResponse.code,
      message: errorResponse.message,
      error: errorResponse.error,
      path: errorResponse.path,
      method: request.method,
      correlationId,
      userId,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      stack: `[STACK] ${JSON.stringify(exception.stack)}`,
    });

    // Send error response
    response.status(status).json(errorResponse);
  }

  private getPrismaErrorMessage(error: PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2002':
        return 'A unique constraint violation occurred. The resource already exists.';
      case 'P2003':
        return 'Foreign key constraint failed. The referenced resource does not exist.';
      case 'P2025':
        return 'The requested resource was not found.';
      case 'P2000':
        return 'The provided value is too long for the database column.';
      case 'P2001':
        return 'The requested resource does not exist.';
      case 'P2004':
        return 'A constraint failed on the database.';
      case 'P2005':
        return 'The value stored in the database is invalid for the field type.';
      case 'P2006':
        return 'The provided value is not valid.';
      case 'P2007':
        return 'Data validation error.';
      case 'P2008':
        return 'Failed to parse the query.';
      case 'P2009':
        return 'Failed to validate the query.';
      case 'P2010':
        return 'Raw query failed.';
      case 'P2011':
        return 'Null constraint violation.';
      case 'P2012':
        return 'Missing a required value.';
      case 'P2013':
        return 'Missing a required argument.';
      case 'P2014':
        return 'The change would violate a required relation.';
      case 'P2015':
        return 'A related record could not be found.';
      case 'P2016':
        return 'Query interpretation error.';
      case 'P2017':
        return 'The records for the relation are not connected.';
      case 'P2018':
        return 'The required connected records were not found.';
      case 'P2019':
        return 'Input error.';
      case 'P2020':
        return 'Value out of range.';
      case 'P2021':
        return 'The table does not exist.';
      case 'P2022':
        return 'The column does not exist.';
      case 'P2023':
        return 'Inconsistent column data.';
      case 'P2024':
        return 'Timed out fetching a new connection from the pool.';
      default:
        return error.message;
    }
  }
}
