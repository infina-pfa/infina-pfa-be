import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerConfig {
  readonly elasticsearchNode: string;
  readonly elasticsearchUsername: string | undefined;
  readonly elasticsearchPassword: string | undefined;
  readonly elasticsearchIndexPrefix: string;
  readonly logLevel: string;
  readonly enableElkLogging: boolean;
  readonly nodeEnv: string;
  readonly isProduction: boolean;
  readonly enableConsoleLogging: boolean;
  readonly enableFileLogging: boolean;
  readonly logFilePath: string;
  readonly maxLogFileSize: string;
  readonly maxLogFiles: string;

  constructor(private readonly configService: ConfigService) {
    this.elasticsearchNode = this.configService.get<string>(
      'ELASTICSEARCH_NODE',
      'http://localhost:9200',
    );
    this.elasticsearchUsername = this.configService.get<string>(
      'ELASTICSEARCH_USERNAME',
    );
    this.elasticsearchPassword = this.configService.get<string>(
      'ELASTICSEARCH_PASSWORD',
    );
    this.elasticsearchIndexPrefix = this.configService.get<string>(
      'ELASTICSEARCH_INDEX_PREFIX',
      'infina-pfa',
    );
    this.logLevel = this.configService.get<string>('LOG_LEVEL', 'info');
    this.enableElkLogging =
      this.configService.get<string>('ENABLE_ELK_LOGGING', 'false') === 'true';
    this.nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    this.isProduction = this.nodeEnv === 'production';
    this.enableConsoleLogging =
      this.configService.get<string>('ENABLE_CONSOLE_LOGGING', 'true') ===
      'true';
    this.enableFileLogging =
      this.configService.get<string>('ENABLE_FILE_LOGGING', 'false') === 'true';
    this.logFilePath = this.configService.get<string>('LOG_FILE_PATH', 'logs');
    this.maxLogFileSize = this.configService.get<string>(
      'MAX_LOG_FILE_SIZE',
      '20m',
    );
    this.maxLogFiles = this.configService.get<string>('MAX_LOG_FILES', '14d');
  }
}
