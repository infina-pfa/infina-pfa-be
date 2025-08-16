import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { Client } from '@elastic/elasticsearch';
import { LoggerConfig } from './logger.config';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;
  private readonly context: string = 'Application';
  private correlationId: string | null = null;

  constructor(private readonly config: LoggerConfig) {
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const transports: winston.transport[] = [];

    // Console transport
    if (this.config.enableConsoleLogging) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.splat(),
            winston.format.colorize(),
            winston.format.printf(
              ({ timestamp, level, message, context, ...meta }: any) => {
                const contextStr = context ? `[${String(context)}]` : '';
                const correlationStr = this.correlationId
                  ? `[${this.correlationId}]`
                  : '';
                const metaStr = Object.keys(meta as Record<string, unknown>)
                  .length
                  ? JSON.stringify(meta)
                  : '';
                return `${String(timestamp)} ${String(level)}: ${correlationStr} ${contextStr} ${String(message)} ${metaStr}`;
              },
            ),
          ),
        }),
      );
    }

    // File transport with rotation
    if (this.config.enableFileLogging) {
      const fileFormat = winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      );

      transports.push(
        new DailyRotateFile({
          filename: `${this.config.logFilePath}/application-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: this.config.maxLogFileSize,
          maxFiles: this.config.maxLogFiles,
          format: fileFormat,
        }),
      );

      transports.push(
        new DailyRotateFile({
          filename: `${this.config.logFilePath}/error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: this.config.maxLogFileSize,
          maxFiles: this.config.maxLogFiles,
          level: 'error',
          format: fileFormat,
        }),
      );
    }

    // Elasticsearch transport
    if (this.config.enableElkLogging) {
      const esClient = new Client({
        node: this.config.elasticsearchNode,
        auth:
          this.config.elasticsearchUsername && this.config.elasticsearchPassword
            ? {
                username: this.config.elasticsearchUsername,
                password: this.config.elasticsearchPassword,
              }
            : undefined,
      });

      const esTransport: any = new ElasticsearchTransport({
        level: this.config.logLevel,
        client: esClient,
        index: `${this.config.elasticsearchIndexPrefix}-${this.config.nodeEnv}`,
        dataStream: false, // Force regular index instead of data stream
        transformer: (logData: Record<string, any>) => {
          const level = logData.level as string;
          const message = logData.message as string;
          const meta = logData.meta as Record<string, unknown> | undefined;
          const metaContext = meta?.context as string | undefined;
          return {
            '@timestamp': new Date().toISOString(),
            severity: level,
            message: message,
            context: metaContext || this.context,
            correlationId: this.correlationId,
            environment: this.config.nodeEnv,
            application: 'infina-pfa-be',
            ...(meta || {}),
          };
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      transports.push(esTransport);
    }

    return winston.createLogger({
      level: this.config.logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      transports,
      exitOnError: false,
    });
  }

  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
  }

  clearCorrelationId(): void {
    this.correlationId = null;
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: any, trace?: string, context?: string): void {
    const meta: Record<string, unknown> = { context: context || this.context };
    if (trace) {
      meta.stack = trace;
    }
    if (message instanceof Error) {
      this.logger.error(message.message, { ...meta, error: message });
    } else {
      this.logger.error(String(message), meta);
    }
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context: context || this.context });
  }

  // Additional method for structured logging
  logStructured(
    level: string,
    message: string,
    meta: Record<string, unknown>,
  ): void {
    this.logger.log(level, message, {
      ...meta,
      context: meta.context || this.context,
    });
  }

  // Log HTTP request
  logHttpRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    userId?: string,
    meta?: Record<string, any>,
  ): void {
    this.logStructured('info', `HTTP ${method} ${url}`, {
      type: 'http_request',
      method,
      url,
      statusCode,
      responseTime,
      userId,
      correlationId: this.correlationId,
      ...meta,
    });
  }

  // Log business event
  logBusinessEvent(
    eventName: string,
    userId: string,
    payload?: Record<string, any>,
  ): void {
    this.logStructured('info', `Business Event: ${eventName}`, {
      type: 'business_event',
      eventName,
      userId,
      payload,
      correlationId: this.correlationId,
    });
  }

  // Log security event
  logSecurityEvent(
    eventType: string,
    userId?: string,
    details?: Record<string, any>,
  ): void {
    this.logStructured('warn', `Security Event: ${eventType}`, {
      type: 'security_event',
      eventType,
      userId,
      details,
      correlationId: this.correlationId,
    });
  }
}
