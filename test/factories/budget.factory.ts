import {
  BudgetCategory,
  BudgetEntity,
} from '../../src/budgeting/domain/entities/budget.entity';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Factory for creating consistent budget test data
 */
export class BudgetFactory {
  /**
   * Create a budget entity with default test values
   */
  static create(
    overrides: Partial<{
      id: string;
      userId: string;
      name: string;
      amount: number;
      category: BudgetCategory;
      color: string;
      icon: string;
      month: number;
      year: number;
      createdAt: Date;
      updatedAt: Date;
    }> = {},
  ): BudgetEntity {
    const defaults = {
      id: `budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'test-user-john-doe-uuid',
      name: 'Test Budget',
      amount: 1000,
      category: BudgetCategory.FIXED,
      color: '#007bff',
      icon: 'shopping-cart',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const budgetData = { ...defaults, ...overrides };

    return BudgetEntity.create(budgetData, defaults.id);
  }

  /**
   * Create multiple budget entities
   */
  static createMany(
    count: number,
    baseOverrides: Partial<{
      userId: string;
      month: number;
      year: number;
    }> = {},
  ): BudgetEntity[] {
    const budgets: BudgetEntity[] = [];

    for (let i = 0; i < count; i++) {
      budgets.push(
        this.create({
          ...baseOverrides,
          name: `Test Budget ${i + 1}`,
          amount: 1000 + i * 100,
          category:
            i % 2 === 0 ? BudgetCategory.FIXED : BudgetCategory.FLEXIBLE,
          color: i % 2 === 0 ? '#007bff' : '#28a745',
          icon: i % 2 === 0 ? 'shopping-cart' : 'home',
        }),
      );
    }

    return budgets;
  }

  /**
   * Create budget data for direct database insertion
   */
  static createDatabaseData(
    overrides: Partial<{
      id: string;
      user_id: string;
      name: string;
      amount: Decimal;
      category: BudgetCategory;
      color: string;
      icon: string;
      month: number;
      year: number;
      created_at: Date;
      updated_at: Date;
    }> = {},
  ) {
    const defaults = {
      user_id: 'test-user-john-doe-uuid',
      name: 'Test Budget',
      amount: new Decimal(1000),
      category: BudgetCategory.FIXED,
      color: '#007bff',
      icon: 'shopping-cart',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    return { ...defaults, ...overrides };
  }

  /**
   * Create a grocery budget
   */
  static createGroceryBudget(
    userId: string = 'test-user-john-doe-uuid',
  ): BudgetEntity {
    return this.create({
      userId,
      name: 'Groceries',
      amount: 500,
      category: BudgetCategory.FLEXIBLE,
      color: '#28a745',
      icon: 'shopping-basket',
    });
  }

  /**
   * Create a rent budget
   */
  static createRentBudget(
    userId: string = 'test-user-john-doe-uuid',
  ): BudgetEntity {
    return this.create({
      userId,
      name: 'Rent',
      amount: 1500,
      category: BudgetCategory.FIXED,
      color: '#007bff',
      icon: 'home',
    });
  }

  /**
   * Create an entertainment budget
   */
  static createEntertainmentBudget(
    userId: string = 'test-user-john-doe-uuid',
  ): BudgetEntity {
    return this.create({
      userId,
      name: 'Entertainment',
      amount: 300,
      category: BudgetCategory.FLEXIBLE,
      color: '#ffc107',
      icon: 'film',
    });
  }

  /**
   * Create budgets for a specific month and year
   */
  static createMonthlyBudgets(
    userId: string,
    month: number,
    year: number,
    count: number = 3,
  ): BudgetEntity[] {
    const budgetTypes = [
      {
        name: 'Groceries',
        amount: 500,
        category: BudgetCategory.FLEXIBLE,
        color: '#28a745',
        icon: 'shopping-basket',
      },
      {
        name: 'Rent',
        amount: 1500,
        category: BudgetCategory.FIXED,
        color: '#007bff',
        icon: 'home',
      },
      {
        name: 'Entertainment',
        amount: 300,
        category: BudgetCategory.FLEXIBLE,
        color: '#ffc107',
        icon: 'film',
      },
      {
        name: 'Transportation',
        amount: 200,
        category: BudgetCategory.FLEXIBLE,
        color: '#17a2b8',
        icon: 'car',
      },
      {
        name: 'Utilities',
        amount: 150,
        category: BudgetCategory.FIXED,
        color: '#6f42c1',
        icon: 'zap',
      },
    ];

    return budgetTypes.slice(0, count).map((type) =>
      this.create({
        userId,
        month,
        year,
        ...type,
      }),
    );
  }
}
