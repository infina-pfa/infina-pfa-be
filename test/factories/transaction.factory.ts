import {
  TransactionEntity,
  TransactionType,
} from '../../src/budgeting/domain/entities/transactions.entity';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Factory for creating consistent transaction test data
 */
export class TransactionFactory {
  /**
   * Create a transaction entity with default test values
   */
  static create(
    overrides: Partial<{
      id: string;
      userId: string;
      name: string;
      description: string;
      amount: number;
      type: TransactionType;
      recurring: number;
      createdAt: Date;
      updatedAt: Date;
    }> = {},
  ): TransactionEntity {
    const defaults = {
      id: `transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'test-user-john-doe-uuid',
      name: 'Test Transaction',
      description: 'Test transaction description',
      amount: 100,
      type: TransactionType.OUTCOME,
      recurring: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const transactionData = { ...defaults, ...overrides };

    return TransactionEntity.create(transactionData);
  }

  /**
   * Create transaction data for direct database insertion
   */
  static createDatabaseData(
    overrides: Partial<{
      id: string;
      user_id: string;
      name: string;
      description: string;
      amount: Decimal;
      type: TransactionType;
      recurring: number;
      created_at: Date;
      updated_at: Date;
    }> = {},
  ) {
    const defaults = {
      id: `transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'test-user-john-doe-uuid',
      name: 'Test Transaction',
      description: 'Test transaction description',
      amount: new Decimal(100),
      type: TransactionType.OUTCOME,
      recurring: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    return { ...defaults, ...overrides };
  }

  /**
   * Create a grocery transaction
   */
  static createGroceryTransaction(
    userId: string = 'test-user-john-doe-uuid',
    amount: number = 75.5,
  ): TransactionEntity {
    return this.create({
      userId,
      name: 'Grocery Shopping',
      description: 'Weekly grocery shopping at SuperMart',
      amount,
      type: TransactionType.OUTCOME,
    });
  }

  /**
   * Create a salary transaction
   */
  static createSalaryTransaction(
    userId: string = 'test-user-john-doe-uuid',
    amount: number = 3000,
  ): TransactionEntity {
    return this.create({
      userId,
      name: 'Monthly Salary',
      description: 'Salary from employer',
      amount,
      type: TransactionType.INCOME,
      recurring: 1, // Monthly recurring
    });
  }

  /**
   * Create a rent transaction
   */
  static createRentTransaction(
    userId: string = 'test-user-john-doe-uuid',
    amount: number = 1200,
  ): TransactionEntity {
    return this.create({
      userId,
      name: 'Monthly Rent',
      description: 'Rent payment for apartment',
      amount,
      type: TransactionType.OUTCOME,
      recurring: 1, // Monthly recurring
    });
  }

  /**
   * Create an entertainment transaction
   */
  static createEntertainmentTransaction(
    userId: string = 'test-user-john-doe-uuid',
    amount: number = 25,
  ): TransactionEntity {
    return this.create({
      userId,
      name: 'Movie Tickets',
      description: 'Cinema tickets for weekend movie',
      amount,
      type: TransactionType.OUTCOME,
    });
  }

  /**
   * Create multiple transactions
   */
  static createMany(
    count: number,
    baseOverrides: Partial<{
      userId: string;
      type: TransactionType;
    }> = {},
  ): TransactionEntity[] {
    const transactions: TransactionEntity[] = [];

    const transactionTypes = [
      { name: 'Grocery Shopping', amount: 75, type: TransactionType.OUTCOME },
      { name: 'Gas Station', amount: 40, type: TransactionType.OUTCOME },
      { name: 'Coffee Shop', amount: 5.5, type: TransactionType.OUTCOME },
      { name: 'Online Purchase', amount: 89.99, type: TransactionType.OUTCOME },
      { name: 'Freelance Work', amount: 500, type: TransactionType.INCOME },
    ];

    for (let i = 0; i < count; i++) {
      const typeIndex = i % transactionTypes.length;
      const transactionType = transactionTypes[typeIndex];

      transactions.push(
        this.create({
          ...baseOverrides,
          name: `${transactionType.name} ${Math.floor(i / transactionTypes.length) + 1}`,
          amount: transactionType.amount + (Math.random() * 20 - 10), // Add some variation
          type: baseOverrides.type || transactionType.type,
          description: `Test ${transactionType.name.toLowerCase()} #${i + 1}`,
        }),
      );
    }

    return transactions;
  }

  /**
   * Create budget transactions for testing budget-transaction relationships
   */
  static createBudgetTransactions(
    budgetId: string,
    userId: string = 'test-user-john-doe-uuid',
    count: number = 3,
  ): TransactionEntity[] {
    const transactions = this.createMany(count, {
      userId,
      type: TransactionType.OUTCOME,
    });

    // In a real scenario, these would be linked through budget_transactions table
    // This factory just creates the transactions that could be associated with a budget
    return transactions;
  }

  /**
   * Create a set of realistic monthly transactions
   */
  static createMonthlyTransactionSet(
    userId: string = 'test-user-john-doe-uuid',
  ): TransactionEntity[] {
    return [
      // Income
      this.createSalaryTransaction(userId, 3500),
      this.create({
        userId,
        name: 'Freelance Project',
        description: 'Web development project',
        amount: 800,
        type: TransactionType.INCOME,
      }),

      // Fixed expenses
      this.createRentTransaction(userId, 1400),
      this.create({
        userId,
        name: 'Utilities',
        description: 'Electricity, water, gas',
        amount: 120,
        type: TransactionType.OUTCOME,
        recurring: 1,
      }),
      this.create({
        userId,
        name: 'Internet',
        description: 'Monthly internet bill',
        amount: 60,
        type: TransactionType.OUTCOME,
        recurring: 1,
      }),

      // Variable expenses
      this.createGroceryTransaction(userId, 85.3),
      this.createGroceryTransaction(userId, 92.15),
      this.createGroceryTransaction(userId, 78.9),
      this.createEntertainmentTransaction(userId, 45),
      this.create({
        userId,
        name: 'Gas',
        description: 'Fuel for car',
        amount: 55,
        type: TransactionType.OUTCOME,
      }),
      this.create({
        userId,
        name: 'Restaurant',
        description: 'Dinner with friends',
        amount: 35.5,
        type: TransactionType.OUTCOME,
      }),
    ];
  }
}
