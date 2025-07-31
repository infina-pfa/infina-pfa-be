import { BudgetAggregate, BudgetCategory } from '@/budgeting/domain';
import { BudgetEntity } from '@/budgeting/domain/entities/budget.entity';
import { CurrencyVO } from '@/common/base';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { ConflictException, Injectable } from '@nestjs/common';
import { BudgetAggregateRepository } from '../domain/repositories/budget-aggregate.repository';
import { TransactionsWatchList } from '../domain/watch-list/transactions.watch-list';

export type CreateBudgetUseCaseInput = {
  amount: number;
  category: BudgetCategory;
  color: string;
  icon: string;
  month: number;
  userId: string;
  year: number;
  name: string;
};

@Injectable()
export class CreateBudgetUseCase extends BaseUseCase<
  CreateBudgetUseCaseInput,
  BudgetAggregate
> {
  constructor(
    private readonly budgetAggregateRepository: BudgetAggregateRepository,
  ) {
    super();
  }

  async execute(input: CreateBudgetUseCaseInput): Promise<BudgetAggregate> {
    // Check if a budget with the same name already exists for this user in this month
    const existingBudget = await this.budgetAggregateRepository.findOne({
      name: input.name,
      userId: input.userId,
      month: input.month,
      year: input.year,
    });

    if (existingBudget) {
      throw new ConflictException(
        `Budget with name '${input.name}' already exists for this month`,
      );
    }

    const budget = BudgetEntity.create({
      ...input,
      amount: new CurrencyVO(input.amount),
    });

    const budgetAggregate = BudgetAggregate.create({
      budget,
      spending: new TransactionsWatchList([]),
    });

    await this.budgetAggregateRepository.save(budgetAggregate);

    return budgetAggregate;
  }
}
