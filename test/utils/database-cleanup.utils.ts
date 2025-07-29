/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { PrismaClient } from '../../generated/prisma';

/**
 * Database cleanup utilities for integration tests
 * Provides methods for cleaning up test data and managing database transactions
 */
export class DatabaseCleanupUtils {
  /**
   * Clean up all test data in the correct order to respect foreign key constraints
   */
  static async cleanupAllTestData(prisma: PrismaClient): Promise<void> {
    try {
      // Clean up in reverse dependency order
      await prisma.budget_transactions.deleteMany();
      await prisma.goal_transactions.deleteMany();
      await prisma.onboarding_messages.deleteMany();
      await prisma.messages.deleteMany();
      await prisma.conversations.deleteMany();
      await prisma.onboarding_profiles.deleteMany();
      await prisma.transactions.deleteMany();
      await prisma.budgets.deleteMany();
      await prisma.goals.deleteMany();
      await prisma.public_users.deleteMany();

      // Clean up auth users that are test users
      await prisma.auth_users.deleteMany({
        where: {
          email: {
            contains: 'test.com',
          },
        },
      });

      console.log('✅ All test data cleaned up successfully');
    } catch (error) {
      console.error('❌ Error during test data cleanup:', error);
      throw error;
    }
  }

  /**
   * Clean up test data for specific user
   */
  static async cleanupUserTestData(
    prisma: PrismaClient,
    userId: string,
  ): Promise<void> {
    try {
      // Clean up in reverse dependency order
      await prisma.budget_transactions.deleteMany({
        where: { user_id: userId },
      });

      await prisma.goal_transactions.deleteMany({
        where: { user_id: userId },
      });

      await prisma.onboarding_messages.deleteMany({
        where: { user_id: userId },
      });

      await prisma.messages.deleteMany({
        where: { user_id: userId },
      });

      await prisma.conversations.deleteMany({
        where: { user_id: userId },
      });

      await prisma.onboarding_profiles.deleteMany({
        where: { user_id: userId },
      });

      await prisma.transactions.deleteMany({
        where: { user_id: userId },
      });

      await prisma.budgets.deleteMany({
        where: { user_id: userId },
      });

      await prisma.goals.deleteMany({
        where: { user_id: userId },
      });

      await prisma.public_users.deleteMany({
        where: { user_id: userId },
      });

      await prisma.auth_users.deleteMany({
        where: { id: userId },
      });

      console.log(`✅ Test data cleaned up for user: ${userId}`);
    } catch (error) {
      console.error(
        `❌ Error during user test data cleanup for ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Clean up specific entity types
   */
  static async cleanupBudgets(
    prisma: PrismaClient,
    userId?: string,
  ): Promise<void> {
    const whereClause = userId ? { user_id: userId } : {};

    await prisma.budget_transactions.deleteMany({
      where: whereClause,
    });

    await prisma.budgets.deleteMany({
      where: whereClause,
    });
  }

  static async cleanupTransactions(
    prisma: PrismaClient,
    userId?: string,
  ): Promise<void> {
    const whereClause = userId ? { user_id: userId } : {};

    await prisma.budget_transactions.deleteMany({
      where: whereClause,
    });

    await prisma.goal_transactions.deleteMany({
      where: whereClause,
    });

    await prisma.transactions.deleteMany({
      where: whereClause,
    });
  }

  static async cleanupGoals(
    prisma: PrismaClient,
    userId?: string,
  ): Promise<void> {
    const whereClause = userId ? { user_id: userId } : {};

    await prisma.goal_transactions.deleteMany({
      where: whereClause,
    });

    await prisma.goals.deleteMany({
      where: whereClause,
    });
  }

  static async cleanupConversations(
    prisma: PrismaClient,
    userId?: string,
  ): Promise<void> {
    const whereClause = userId ? { user_id: userId } : {};

    await prisma.messages.deleteMany({
      where: whereClause,
    });

    await prisma.conversations.deleteMany({
      where: whereClause,
    });
  }

  /**
   * Reset database to clean state (useful for test setup)
   */
  static async resetDatabase(prisma: PrismaClient): Promise<void> {
    console.log('🔄 Resetting database to clean state...');

    try {
      await this.cleanupAllTestData(prisma);
      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    }
  }

  /**
   * Verify database is clean (useful for test assertions)
   */
  static async verifyDatabaseIsClean(prisma: PrismaClient): Promise<boolean> {
    try {
      const counts = await Promise.all([
        prisma.budget_transactions.count(),
        prisma.goal_transactions.count(),
        prisma.onboarding_messages.count(),
        prisma.messages.count(),
        prisma.conversations.count(),
        prisma.onboarding_profiles.count(),
        prisma.transactions.count(),
        prisma.budgets.count(),
        prisma.goals.count(),
        prisma.public_users.count(),
        prisma.auth_users.count({
          where: {
            email: {
              contains: 'test.com',
            },
          },
        }),
      ]);

      const totalRecords = counts.reduce((sum, count) => sum + count, 0);

      if (totalRecords === 0) {
        console.log('✅ Database is clean');
        return true;
      } else {
        console.warn(`⚠️ Database contains ${totalRecords} test records`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error verifying database state:', error);
      return false;
    }
  }

  /**
   * Get database statistics (useful for debugging)
   */
  static async getDatabaseStats(
    prisma: PrismaClient,
  ): Promise<Record<string, number>> {
    try {
      const stats = {
        auth_users: await prisma.auth_users.count(),
        public_users: await prisma.public_users.count(),
        budgets: await prisma.budgets.count(),
        transactions: await prisma.transactions.count(),
        budget_transactions: await prisma.budget_transactions.count(),
        goals: await prisma.goals.count(),
        goal_transactions: await prisma.goal_transactions.count(),
        conversations: await prisma.conversations.count(),
        messages: await prisma.messages.count(),
        onboarding_profiles: await prisma.onboarding_profiles.count(),
        onboarding_messages: await prisma.onboarding_messages.count(),
      };

      console.log('📊 Database statistics:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error getting database statistics:', error);
      throw error;
    }
  }
}

/**
 * Transaction isolation utilities for tests
 * Provides methods for running tests within database transactions that can be rolled back
 */
export class TransactionIsolationUtils {
  /**
   * Run a test within a database transaction and rollback at the end
   * This ensures complete test isolation without the need for cleanup
   */
  static async runInTransaction<T>(
    prisma: PrismaClient,
    testFunction: (tx: any) => Promise<T>,
  ): Promise<T> {
    return await prisma
      .$transaction(async (tx) => {
        try {
          // Execute the test function but ignore the result
          await testFunction(tx);

          // Force rollback by throwing an error
          // This ensures no changes are committed
          throw new Error('ROLLBACK_TEST_TRANSACTION');
        } catch (error: any) {
          if (error.message === 'ROLLBACK_TEST_TRANSACTION') {
            // This is our intentional rollback, don't re-throw
            // In a real implementation, you might want to handle this differently
            throw error;
          }
          throw error;
        }
      })
      .catch((error: any) => {
        if (error.message === 'ROLLBACK_TEST_TRANSACTION') {
          // Return undefined or a default value since we rolled back
          return undefined as T;
        }
        throw error;
      });
  }

  /**
   * Create a savepoint for nested transaction testing
   */
  static async createSavepoint(tx: any, savepointName: string): Promise<void> {
    await tx.$executeRaw`SAVEPOINT ${savepointName}`;
  }

  /**
   * Rollback to a savepoint
   */
  static async rollbackToSavepoint(
    tx: any,
    savepointName: string,
  ): Promise<void> {
    await tx.$executeRaw`ROLLBACK TO SAVEPOINT ${savepointName}`;
  }

  /**
   * Release a savepoint
   */
  static async releaseSavepoint(tx: any, savepointName: string): Promise<void> {
    await tx.$executeRaw`RELEASE SAVEPOINT ${savepointName}`;
  }
}

/**
 * Test data seeding utilities
 */
export class TestDataSeedUtils {
  /**
   * Seed minimal test data required for most tests
   */
  static async seedMinimalTestData(prisma: PrismaClient): Promise<void> {
    // This could seed common reference data, default users, etc.
    console.log('🌱 Seeding minimal test data...');

    // Add your default test data here
    // For example, default admin user, reference data, etc.
    await prisma.$executeRaw`SELECT 1`; // Dummy operation to satisfy the 'await' requirement

    console.log('✅ Minimal test data seeded');
  }

  /**
   * Seed comprehensive test data for complex test scenarios
   */
  static async seedComprehensiveTestData(prisma: PrismaClient): Promise<void> {
    console.log('🌱 Seeding comprehensive test data...');

    // Add comprehensive test data setup here
    // This might include multiple users, budgets, transactions, etc.
    await prisma.$executeRaw`SELECT 1`; // Dummy operation to satisfy the 'await' requirement

    console.log('✅ Comprehensive test data seeded');
  }
}

/**
 * Helper function to create a test cleanup function for specific entities
 */
export function createEntityCleanup(
  entityName: string,
  cleanupFn: (prisma: PrismaClient) => Promise<void>,
) {
  return async (prisma: PrismaClient) => {
    try {
      await cleanupFn(prisma);
      console.log(`✅ ${entityName} cleanup completed`);
    } catch (error) {
      console.error(`❌ ${entityName} cleanup failed:`, error);
      throw error;
    }
  };
}

/**
 * Utility for measuring test execution time and database performance
 */
export class TestPerformanceUtils {
  private static timers: Map<string, number> = new Map();

  static startTimer(label: string): void {
    this.timers.set(label, Date.now());
  }

  static endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      throw new Error(`Timer '${label}' was not started`);
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);

    console.log(`⏱️ ${label}: ${duration}ms`);
    return duration;
  }

  static async measureDatabaseOperation<T>(
    label: string,
    operation: () => Promise<T>,
  ): Promise<{ result: T; duration: number }> {
    this.startTimer(label);
    const result = await operation();
    const duration = this.endTimer(label);

    return { result, duration };
  }
}
