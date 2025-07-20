import { Injectable } from '@nestjs/common';
import { BudgetEntity, BudgetRepository } from '../domain';
import { BaseUseCase } from '@/common/use-case/base.use-case';

@Injectable()
export class GetBudgetsUseCase extends BaseUseCase<
  { userId: string },
  BudgetEntity[]
> {
  constructor(private readonly budgetRepository: BudgetRepository) {
    super();
  }

  async execute(input: { userId: string }): Promise<BudgetEntity[]> {
    const budgets = await this.budgetRepository.findMany({
      userId: input.userId,
    });

    return budgets;
  }
}
