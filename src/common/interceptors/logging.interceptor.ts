import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

interface ErrorWithStack {
  message: string;
  stack?: string;
}

interface RequestData {
  method: string;
  url: string;
  ip: string;
  body: Record<string, unknown>;
  params: Record<string, unknown>;
  query: Record<string, unknown>;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Explicitly type each property from request
    const method = request.method;
    const url = request.url;
    const ip = request.ip as string;
    const body = request.body as Record<string, unknown>;
    const params = request.params as Record<string, unknown>;
    const query = request.query as Record<string, unknown>;

    const requestData: RequestData = {
      method,
      url,
      ip,
      body,
      params,
      query,
    };

    const now = Date.now();
    this.logger.log(`Request: ${JSON.stringify(requestData)}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `Response: ${url} ${method} ${response.statusCode} - ${responseTime}ms`,
          );
        },
        error: (error: ErrorWithStack) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `Error in ${url} ${method} ${response.statusCode} - ${responseTime}ms: ${error.message}`,
          );
        },
      }),
    );
  }
}
