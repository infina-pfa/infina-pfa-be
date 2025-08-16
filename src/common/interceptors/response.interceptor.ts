import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response as ExpressResponse } from 'express';

export interface Response<T> {
  data: T;
  status: number;
  code: string;
  timestamp: string;
  correlationId?: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const now = new Date();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<ExpressResponse>();

    // Extract correlation ID from request headers (set by LoggingInterceptor)
    const correlationId =
      (request.headers['x-correlation-id'] as string) ||
      (request.headers['x-request-id'] as string);

    return next.handle().pipe(
      map((data: T) => ({
        data,
        status: response.statusCode,
        code: 'success',
        timestamp: now.toISOString(),
        correlationId,
      })),
    );
  }
}
