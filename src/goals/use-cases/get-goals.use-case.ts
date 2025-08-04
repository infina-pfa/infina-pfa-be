import { GoalAggregate, GoalAggregateRepository } from '@/goals/domain';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';

export interface GetGoalsUseCaseInput {
  userId: string;
}

@Injectable()
export class GetGoalsUseCase extends BaseUseCase<
  GetGoalsUseCaseInput,
  GoalAggregate[]
> {
  constructor(
    private readonly goalAggregateRepository: GoalAggregateRepository,
  ) {
    super();
  }

  async execute(input: GetGoalsUseCaseInput): Promise<GoalAggregate[]> {
    const goals = await this.goalAggregateRepository.findMany({
      userId: input.userId,
    });

    return goals;
  }
}
