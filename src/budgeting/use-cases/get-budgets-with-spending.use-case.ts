import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '@/common/use-case/base.use-case';
import { BudgetAnalyticsService } from '../domain/services/budget-analytics.service';
import { BudgetWithSpendingProjection } from '../domain/projections/budget-with-spending.projection';

export interface GetBudgetsWithSpendingUseCaseInput {
  userId: string;
  month?: number;
  year?: number;
}

@Injectable()
export class GetBudgetsWithSpendingUseCase extends BaseUseCase<
  GetBudgetsWithSpendingUseCaseInput,
  BudgetWithSpendingProjection[]
> {
  constructor(private readonly budgetAnalyticsService: BudgetAnalyticsService) {
    super();
  }

  async execute(
    input: GetBudgetsWithSpendingUseCaseInput,
  ): Promise<BudgetWithSpendingProjection[]> {
    return await this.budgetAnalyticsService.getBudgetsWithSpending(
      input.userId,
      input.month,
      input.year,
    );
  }
}
