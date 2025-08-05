import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { BudgetAggregateRepository, BudgetErrorFactory } from '../domain';

type DeleteBudgetUseCaseInput = {
  budgetId: string;
  userId?: string;
};

@Injectable()
export class DeleteBudgetUseCase extends BaseUseCase<
  DeleteBudgetUseCaseInput,
  void
> {
  constructor(
    private readonly budgetAggregateRepository: BudgetAggregateRepository,
  ) {
    super();
  }

  async execute(input: DeleteBudgetUseCaseInput): Promise<void> {
    const budgetAggregate = await this.budgetAggregateRepository.findById(
      input.budgetId,
    );

    if (
      !budgetAggregate ||
      (input.userId && budgetAggregate.props.budget.userId !== input.userId)
    ) {
      throw BudgetErrorFactory.budgetNotFound();
    }

    await this.budgetAggregateRepository.delete(budgetAggregate);
  }
}
