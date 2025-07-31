import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BudgetAggregate,
  BudgetAggregateRepository,
  BudgetEntityProps,
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
      throw new NotFoundException('Budget not found');
    }

    budgetAggregate.budget.update(input.props);

    await this.budgetAggregateRepository.save(budgetAggregate);

    return budgetAggregate;
  }
}
