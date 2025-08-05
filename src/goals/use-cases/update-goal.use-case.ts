import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import {
  GoalAggregate,
  GoalAggregateRepository,
  GoalEntityProps,
  GoalErrorFactory,
} from '../domain';

type UpdateGoalUseCaseInput = {
  id: string;
  userId?: string;
  props: Omit<
    Partial<GoalEntityProps>,
    'id' | 'userId' | 'createdAt' | 'updatedAt'
  >;
};

@Injectable()
export class UpdateGoalUseCase extends BaseUseCase<
  UpdateGoalUseCaseInput,
  GoalAggregate
> {
  constructor(
    private readonly goalAggregateRepository: GoalAggregateRepository,
  ) {
    super();
  }

  async execute(input: UpdateGoalUseCaseInput): Promise<GoalAggregate> {
    // Find goal aggregate by ID
    const goalAggregate = await this.goalAggregateRepository.findById(input.id);

    if (!goalAggregate) {
      throw GoalErrorFactory.goalNotFound();
    }

    // Security check - verify user ownership (throw GoalErrorFactory.goalNotFound() if not owned)
    if (input.userId && goalAggregate.userId !== input.userId) {
      throw GoalErrorFactory.goalNotFound();
    }

    // Business validation for title uniqueness (if title is being updated)
    if (input.props.title) {
      const existingGoal = await this.goalAggregateRepository.findOne({
        title: input.props.title,
        userId: input.userId,
      });

      if (existingGoal && existingGoal.id !== input.id) {
        throw GoalErrorFactory.goalTitleAlreadyExists(input.props.title);
      }
    }

    // Update goal details using existing goalAggregate.updateGoalDetails(input.props)
    goalAggregate.updateGoalDetails(input.props);

    // Save aggregate
    await this.goalAggregateRepository.save(goalAggregate);

    return goalAggregate;
  }
}
