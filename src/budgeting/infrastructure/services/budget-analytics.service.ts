import { Injectable } from '@nestjs/common';
import { BudgetWithSpendingProjection } from '../../domain/projections/budget-with-spending.projection';
import { BudgetRepository } from '../../domain/repositories/budget.repository';

@Injectable()
export class BudgetAnalyticsServiceImpl {
  constructor(private readonly budgetRepository: BudgetRepository) {}

  async getBudgetsWithSpending(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<BudgetWithSpendingProjection[]> {
    // Default to current month/year if not provided
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    // Get budgets with spending data using single optimized query
    const budgetsWithSpendingData =
      await this.budgetRepository.findManyWithSpending(
        userId,
        targetMonth,
        targetYear,
      );

    // Transform to projections
    return budgetsWithSpendingData.map((data) =>
      BudgetWithSpendingProjection.create(
        data.budget,
        data.totalSpent,
        data.transactionCount,
      ),
    );
  }
}
