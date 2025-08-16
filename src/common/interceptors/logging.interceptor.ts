import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
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
  correlationId: string;
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

    // Generate or extract correlation ID
    const correlationId =
      (request.headers['x-correlation-id'] as string) ||
      (request.headers['x-request-id'] as string) ||
      uuidv4();

    // Set correlation ID in logger
    this.logger.setCorrelationId(correlationId);

    // Set correlation ID in response headers
    response.setHeader('x-correlation-id', correlationId);

    // Extract user information if available
    const userId = request.user?.id;

    // Explicitly type each property from request
    const method = request.method;
    const url = request.url;
    const ip = request.ip as string;
    const body = this.sanitizeBody(request.body as Record<string, unknown>);
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
      correlationId,
    };

    const now = Date.now();

    // Log incoming request
    this.logger.logStructured('info', `Incoming ${method} ${url}`, {
      type: 'http_request_start',
      ...requestData,
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
              correlationId,
              ip,
              responseSize: JSON.stringify(data || {}).length,
            },
          );

          // Clear correlation ID after request
          this.logger.clearCorrelationId();
        },
      }),
    );
  }

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body) return {};

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'authorization',
      'api_key',
      'apiKey',
      'access_token',
      'refresh_token',
      'credit_card',
      'card_number',
      'cvv',
      'ssn',
    ];

    const sanitized = { ...body };

    Object.keys(sanitized).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (
        typeof sanitized[key] === 'object' &&
        sanitized[key] !== null
      ) {
        sanitized[key] = this.sanitizeBody(
          sanitized[key] as Record<string, unknown>,
        );
      }
    });

    return sanitized;
  }
}
