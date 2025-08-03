import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient as PrismaClientNative } from '../../../generated/prisma';

@Injectable()
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
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
