import { Injectable } from '@nestjs/common';
import { BudgetEntity, BudgetRepository } from '../domain';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';

@Injectable()
export class GetBudgetsUseCase extends BaseUseCase<
  { userId: string; month: number; year: number },
  BudgetEntity[]
> {
  constructor(private readonly budgetRepository: BudgetRepository) {
    super();
  }

  async execute(input: {
    userId: string;
    month: number;
    year: number;
  }): Promise<BudgetEntity[]> {
    const budgets = await this.budgetRepository.findMany({
      userId: input.userId,
      month: input.month,
      year: input.year,
    });

    return budgets;
  }
}
