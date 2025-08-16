import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './logger.service';
import { LoggerConfig } from './logger.config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [LoggerConfig, LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
