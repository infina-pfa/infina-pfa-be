import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { BudgetAggregate, BudgetAggregateRepository } from '../domain';

@Injectable()
export class GetBudgetDetailUseCase extends BaseUseCase<
  { id: string; userId?: string },
  BudgetAggregate
> {
  constructor(
    private readonly budgetAggregateRepository: BudgetAggregateRepository,
  ) {
    super();
  }

  async execute(input: {
    id: string;
    userId?: string;
  }): Promise<BudgetAggregate> {
    const budget = await this.budgetAggregateRepository.findById(input.id);

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    // Check if budget belongs to the user
    if (input.userId && budget.userId !== input.userId) {
      throw new ForbiddenException('Access denied to budget');
    }

    // Check if budget is archived
    if (budget.budget.isArchived()) {
      throw new NotFoundException('Budget not found');
    }

    return budget;
  }
}
