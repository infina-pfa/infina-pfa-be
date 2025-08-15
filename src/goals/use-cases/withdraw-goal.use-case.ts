import {
  GoalAggregate,
  GoalAggregateRepository,
  GoalErrorFactory,
} from '@/goals/domain';
import { CurrencyVO } from '@/common/base';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';

export interface WithdrawGoalUseCaseInput {
  goalId: string;
  userId?: string;
  amount: number;
  name?: string;
  description?: string;
  recurring?: number;
}

@Injectable()
export class WithdrawGoalUseCase extends BaseUseCase<
  WithdrawGoalUseCaseInput,
  GoalAggregate
> {
  constructor(
    private readonly goalAggregateRepository: GoalAggregateRepository,
  ) {
    super();
  }

  async execute(input: WithdrawGoalUseCaseInput): Promise<GoalAggregate> {
    // Find the goal
    const goalAggregate = await this.goalAggregateRepository.findById(
      input.goalId,
    );

    if (!goalAggregate) {
      throw GoalErrorFactory.goalNotFound();
    }

    // Validate ownership
    if (input.userId && goalAggregate.userId !== input.userId) {
      throw GoalErrorFactory.goalNotFound(); // Don't reveal goal exists for security
    }

    // Get the goal's currency from targetAmount or currentAmount
    const goalCurrency = goalAggregate.goal.targetAmount?.currency;

    // Create CurrencyVO using goal's currency
    const withdrawalAmount = new CurrencyVO(input.amount, goalCurrency);

    // Use the domain method to withdraw (includes balance validation)
    goalAggregate.withdraw({
      amount: withdrawalAmount,
      name: input.name,
      description: input.description,
      recurring: input.recurring,
    });

    // Save the updated aggregate
    await this.goalAggregateRepository.save(goalAggregate);

    return goalAggregate;
  }
}
