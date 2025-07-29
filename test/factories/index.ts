import { BudgetEntity } from '../../src/budgeting/domain/entities/budget.entity';
import { BudgetFactory } from './budget.factory';
import { TransactionEntity } from '../../src/budgeting/domain/entities/transactions.entity';
import { TransactionFactory } from './transaction.factory';
import { BudgetTransactionAggregate } from '../../src/budgeting/domain/entities/budget-transaction.aggregate';
import { UserFactory } from './user.factory';
import { PrismaClient } from '../../generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Consolidated factory utilities for creating test data
 */
export class TestDataFactory {
  /**
   * Create a complete test scenario with user, budgets, and transactions
   */
  static async createCompleteTestScenario(
    prisma: PrismaClient,
    userId: string = 'test-user-john-doe-uuid',
  ) {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Create user data
    const userSetup = UserFactory.createCompleteUserSetup({
      userId,
      email: 'john.doe@test.com',
      name: 'John Doe',
    });

    // Create auth user
    const authUser = await prisma.auth_users.create({
      data: userSetup.authUser,
    });

    // Create public user
    const publicUser = await prisma.public_users.create({
      data: userSetup.publicUser,
    });

    // Create onboarding profile
    const onboardingProfile = await prisma.onboarding_profiles.create({
      data: userSetup.onboardingProfile,
    });

    // Create budgets
    const budgets = BudgetFactory.createMonthlyBudgets(
      userId,
      currentMonth,
      currentYear,
      3,
    );
    const createdBudgets: BudgetEntity[] = [];

    for (const budget of budgets) {
      const budgetData = BudgetFactory.createDatabaseData({
        user_id: userId,
        name: budget.props.name,
        amount: new Decimal(budget.props.amount),
        category: budget.props.category,
        color: budget.props.color,
        icon: budget.props.icon,
        month: currentMonth,
        year: currentYear,
      });

      const createdBudget = await prisma.budgets.create({
        data: budgetData,
      });

      createdBudgets.push(createdBudget as unknown as BudgetEntity);
    }

    // Create transactions
    const transactions = TransactionFactory.createMonthlyTransactionSet(userId);
    const createdTransactions: TransactionEntity[] = [];

    for (const transaction of transactions) {
      const transactionData = TransactionFactory.createDatabaseData({
        user_id: userId,
        name: transaction.props.name,
        description: transaction.props.description,
        amount: new Decimal(transaction.props.amount),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        type: transaction.props.type as any,
        recurring: transaction.props.recurring,
      });

      const createdTransaction = await prisma.transactions.create({
        data: transactionData,
      });

      createdTransactions.push(
        createdTransaction as unknown as TransactionEntity,
      );
    }

    // Create some budget-transaction relationships
    const budgetTransactions: BudgetTransactionAggregate[] = [];
    for (
      let i = 0;
      i < Math.min(createdBudgets.length, createdTransactions.length);
      i++
    ) {
      const budgetTransaction = await prisma.budget_transactions.create({
        data: {
          user_id: userId,
          budget_id: createdBudgets[i].id,
          transaction_id: createdTransactions[i].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      budgetTransactions.push(
        budgetTransaction as unknown as BudgetTransactionAggregate,
      );
    }

    return {
      authUser,
      publicUser,
      onboardingProfile,
      budgets: createdBudgets,
      transactions: createdTransactions,
      budgetTransactions,
    };
  }

  /**
   * Create minimal test data for basic tests
   */
  static async createMinimalTestData(
    prisma: PrismaClient,
    userId: string = 'test-user-john-doe-uuid',
  ) {
    // Create just the essential user data
    const authUser = await prisma.auth_users.create({
      data: UserFactory.createAuthUserData({ id: userId }),
    });

    const publicUser = await prisma.public_users.create({
      data: UserFactory.createDatabaseData({ user_id: userId }),
    });

    return {
      authUser,
      publicUser,
    };
  }

  /**
   * Clean up all test data for a specific user
   */
  static async cleanupUserTestData(prisma: PrismaClient, userId: string) {
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
  }
}

// Re-export UserFactory for backward compatibility
export { UserFactory };
