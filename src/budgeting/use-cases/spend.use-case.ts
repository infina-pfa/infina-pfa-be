import { CurrencyVO } from '@/common/base';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import {
  BudgetAggregate,
  BudgetAggregateRepository,
  BudgetErrorFactory,
} from '../domain';

type SpendUseCaseInput = {
  budgetId: string;
  userId: string;
  amount: number;
  name?: string;
  description?: string;
  recurring?: number;
};

@Injectable()
export class SpendUseCase extends BaseUseCase<
  SpendUseCaseInput,
  BudgetAggregate
> {
  constructor(
    private readonly budgetAggregateRepository: BudgetAggregateRepository,
  ) {
    super();
  }

  async execute(input: SpendUseCaseInput): Promise<BudgetAggregate> {
    const budgetAggregate = await this.budgetAggregateRepository.findById(
      input.budgetId,
    );

    if (!budgetAggregate) {
      throw BudgetErrorFactory.budgetNotFound();
    }

    if (budgetAggregate.userId !== input.userId) {
      throw BudgetErrorFactory.budgetNotBelongToUser();
    }

    budgetAggregate.spend({
      amount: new CurrencyVO(input.amount),
      name: input.name,
      description: input.description,
      recurring: input.recurring,
    });

    await this.budgetAggregateRepository.save(budgetAggregate);

    return budgetAggregate;
  }
}
