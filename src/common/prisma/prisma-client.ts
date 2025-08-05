import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient as PrismaClientNative } from '../../../generated/prisma';

interface QueryEvent {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
}

export class PrismaClient
  extends PrismaClientNative
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const url =
      process.env.NODE_ENV === 'test'
        ? process.env.E2E_TEST_DATABASE_URL
        : process.env.DATABASE_URL;

    super({
      datasources: {
        db: {
          url,
        },
      },
      log: [{ emit: 'event', level: 'query' }],
    });

    // @ts-expect-error - Type definitions don't include the query event
    this.$on('query', (e: QueryEvent) => {
      Logger.debug('PRISMA', {
        query: e.query,
        duration: `${e.duration}ms`,
        timestamp: e.timestamp,
      });
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
