import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import {
  BudgetAggregate,
  BudgetAggregateRepository,
  BudgetEntityProps,
  BudgetErrorFactory,
} from '../domain';

type UpdateBudgetUseCaseInput = {
  id: string;
  props: Omit<Partial<BudgetEntityProps>, 'createdAt' | 'updatedAt'>;
};

@Injectable()
export class UpdateBudgetUseCase extends BaseUseCase<
  UpdateBudgetUseCaseInput,
  BudgetAggregate
> {
  constructor(
    private readonly budgetAggregateRepository: BudgetAggregateRepository,
  ) {
    super();
  }

  async execute(input: UpdateBudgetUseCaseInput): Promise<BudgetAggregate> {
    const budgetAggregate = await this.budgetAggregateRepository.findById(
      input.id,
    );

    if (!budgetAggregate) {
      throw BudgetErrorFactory.budgetNotFound();
    }

    // Check if the budget belongs to the user
    if (budgetAggregate.userId !== input.props.userId) {
      throw BudgetErrorFactory.budgetNotFound();
    }

    // Check if budget is archived
    if (budgetAggregate.budget.isArchived()) {
      throw BudgetErrorFactory.budgetNotFound();
    }

    budgetAggregate.budget.update(input.props);

    await this.budgetAggregateRepository.save(budgetAggregate);

    return budgetAggregate;
  }
}
