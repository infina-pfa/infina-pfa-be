import { SupabaseAuthGuard } from '@/common/guards';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MockGuard } from '../mocks/guard.mock';
import { PrismaClient } from '../../generated/prisma';
import { AppModule } from '../../src/app.module';
import { TestDatabaseManager } from './database.setup';

export class AppSetup {
  static async initApp(): Promise<{
    app: INestApplication;
    prisma: PrismaClient;
  }> {
    const prisma = await TestDatabaseManager.setupTestDatabase();

    // Create test module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SupabaseAuthGuard)
      .useClass(MockGuard)
      .compile();

    const app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    return {
      app,
      prisma,
    };
  }
}
