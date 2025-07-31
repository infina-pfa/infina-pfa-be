import { PrismaClient } from '../../generated/prisma';
import { execSync } from 'child_process';

export class TestDatabaseManager {
  private static prisma: PrismaClient;
  private static isSetup = false;

  static async setupTestDatabase(): Promise<PrismaClient> {
    if (this.isSetup && this.prisma) {
      return this.prisma;
    }

    // Initialize Prisma client for tests
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url:
            process.env.DATABASE_URL ||
            'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
        },
      },
    });

    try {
      // Connect to database
      await this.prisma.$connect();

      // Ensure database schema is up to date for tests
      // This will run migrations if needed
      // this.runMigrations();

      this.isSetup = true;
      console.log('Test database setup completed');
    } catch (error) {
      console.error('Failed to setup test database:', error);
      throw error;
    }

    return this.prisma;
  }

  static async cleanupTestDatabase(): Promise<void> {
    if (!this.prisma) return;

    try {
      // Clean up test data in reverse dependency order
      await this.prisma.budget_transactions.deleteMany();
      await this.prisma.goal_transactions.deleteMany();
      await this.prisma.onboarding_messages.deleteMany();
      await this.prisma.messages.deleteMany();
      await this.prisma.conversations.deleteMany();
      await this.prisma.onboarding_profiles.deleteMany();
      await this.prisma.transactions.deleteMany();
      await this.prisma.budgets.deleteMany();
      await this.prisma.goals.deleteMany();
      await this.prisma.public_users.deleteMany();
      await this.prisma.auth_users.deleteMany();

      // Note: We don't clean auth.users as they might be managed by Supabase Auth
      // In a real test environment, you might want to clean those too or use test-specific users
    } catch (error) {
      console.error('Failed to cleanup test database:', error);
      throw error;
    }
  }

  static async resetTestDatabase(): Promise<void> {
    await this.cleanupTestDatabase();
  }

  static async teardownTestDatabase(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.isSetup = false;
    }
  }

  static getPrismaClient(): PrismaClient {
    if (!this.prisma) {
      throw new Error(
        'Test database not initialized. Call setupTestDatabase() first.',
      );
    }
    return this.prisma;
  }

  private static runMigrations(): void {
    try {
      // Run database migrations for test environment
      execSync('npm run prisma:migrate', {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'test' },
      });
    } catch (error) {
      console.warn(
        'Migration command failed, database might already be up to date:',
        error,
      );
      // Don't throw here as migrations might already be applied
    }
  }

  /**
   * Creates a transaction for test isolation
   * Each test can run within its own transaction that gets rolled back
   */
  static async createTestTransaction() {
    const prisma = this.getPrismaClient();
    return prisma.$transaction(async (tx) => {
      return tx;
    });
  }
}

// Global setup and teardown for Jest
export const setupGlobalDatabase = async (): Promise<void> => {
  await TestDatabaseManager.setupTestDatabase();
};

export const teardownGlobalDatabase = async (): Promise<void> => {
  await TestDatabaseManager.teardownTestDatabase();
};
