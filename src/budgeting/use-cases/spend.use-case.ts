import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { CurrencyVO } from '@/common/base';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BudgetAggregateRepository } from '../domain';

type SpendUseCaseInput = {
  budgetId: string;
  userId: string;
  amount: number;
  name?: string;
  description?: string;
  recurring?: number;
};

@Injectable()
export class SpendUseCase extends BaseUseCase<SpendUseCaseInput, void> {
  constructor(
    private readonly budgetAggregateRepository: BudgetAggregateRepository,
  ) {
    super();
  }

  async execute(input: SpendUseCaseInput): Promise<void> {
    const budgetAggregate = await this.budgetAggregateRepository.findById(
      input.budgetId,
    );

    if (!budgetAggregate) {
      throw new NotFoundException('Budget not found');
    }

    budgetAggregate.spend({
      amount: new CurrencyVO(input.amount),
      name: input.name,
      description: input.description,
      recurring: input.recurring,
    });

    await this.budgetAggregateRepository.save(budgetAggregate);
  }
}
