import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { BudgetAggregate, BudgetAggregateRepository } from '../domain';

@Injectable()
export class GetBudgetsUseCase extends BaseUseCase<
  { userId: string; month: number; year: number },
  BudgetAggregate[]
> {
  constructor(
    private readonly budgetAggregateRepository: BudgetAggregateRepository,
  ) {
    super();
  }

  async execute(input: {
    userId: string;
    month: number;
    year: number;
  }): Promise<BudgetAggregate[]> {
    const budgets = await this.budgetAggregateRepository.findMany({
      userId: input.userId,
      month: input.month,
      year: input.year,
    });

    return budgets;
  }
}
