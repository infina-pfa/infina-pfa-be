import { BudgetWithSpendingProjection } from '../projections/budget-with-spending.projection';

export abstract class BudgetAnalyticsService {
  abstract getBudgetsWithSpending(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<BudgetWithSpendingProjection[]>;
}
