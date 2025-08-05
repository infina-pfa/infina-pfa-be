import {
  GoalAggregate,
  GoalEntity,
  GoalAggregateRepository,
  GoalErrorFactory,
} from '@/goals/domain';
import { GoalTransactionsWatchList } from '@/goals/domain/watch-list/goal-transactions.watch-list';
import { CurrencyVO } from '@/common/base';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';

export interface CreateGoalUseCaseInput {
  userId: string;
  title: string;
  description?: string;
  targetAmount?: number;
  dueDate?: Date;
}

@Injectable()
export class CreateGoalUseCase extends BaseUseCase<
  CreateGoalUseCaseInput,
  GoalAggregate
> {
  constructor(
    private readonly goalAggregateRepository: GoalAggregateRepository,
  ) {
    super();
  }

  async execute(input: CreateGoalUseCaseInput): Promise<GoalAggregate> {
    // Validation: Title uniqueness per user
    const existingGoal = await this.goalAggregateRepository.findOne({
      title: input.title,
      userId: input.userId,
    });

    if (existingGoal) {
      throw GoalErrorFactory.goalTitleAlreadyExists(input.title);
    }

    // Validation: Positive target amount
    if (input.targetAmount !== undefined && input.targetAmount <= 0) {
      throw GoalErrorFactory.goalInvalidTargetAmount();
    }

    // Validation: Future due date
    if (input.dueDate && input.dueDate <= new Date()) {
      throw GoalErrorFactory.goalInvalidDueDate();
    }

    // Create Goal Entity
    const goal = GoalEntity.create({
      userId: input.userId,
      title: input.title,
      description: input.description,
      targetAmount: input.targetAmount
        ? new CurrencyVO(input.targetAmount)
        : undefined,
      dueDate: input.dueDate,
      deletedAt: null,
    });

    // Create Goal Aggregate with empty contributions
    const goalAggregate = GoalAggregate.create({
      goal,
      transactions: new GoalTransactionsWatchList([]),
    });

    // Save to repository
    await this.goalAggregateRepository.save(goalAggregate);

    return goalAggregate;
  }
}
