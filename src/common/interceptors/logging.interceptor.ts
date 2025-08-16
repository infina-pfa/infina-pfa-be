import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';
import { User } from '@supabase/supabase-js';

interface RequestData {
  method: string;
  url: string;
  ip: string;
  body: Record<string, unknown>;
  params: Record<string, unknown>;
  query: Record<string, unknown>;
  headers?: Record<string, unknown>;
  userId?: string;
}

// Extend Express Request to include user
interface RequestWithUser extends Request {
  user?: User;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context.switchToHttp().getResponse<Response>();

    // Extract user information if available
    const userId = request.user?.id;

    // Explicitly type each property from request
    const method = request.method;
    const url = request.url;
    const ip = request.ip as string;
    const body = this.logger.sanitizeBody(
      request.body as Record<string, unknown>,
    );
    const params = request.params as Record<string, unknown>;
    const query = request.query as Record<string, unknown>;
    const userAgent = request.headers['user-agent'] as string;

    const requestData: RequestData = {
      method,
      url,
      ip,
      body,
      params,
      query,
      headers: {
        'user-agent': userAgent,
        'content-type': request.headers['content-type'],
      },
      userId,
    };

    const now = Date.now();

    // Log incoming request
    this.logger.logStructured('info', `Incoming ${method} ${url}`, {
      type: 'http_request_start',
      req: `[REQUEST]: ${JSON.stringify(requestData)}`,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;

          // Log successful response
          this.logger.logHttpRequest(
            method,
            url,
            response.statusCode,
            responseTime,
            userId,
            {
              ip,
              res: `[RESPONSE]: ${JSON.stringify(this.logger.sanitizeBody(data as Record<string, any>))}`,
            },
          );
        },
      }),
    );
  }
}
