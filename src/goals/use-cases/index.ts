export * from './create-goal.use-case';
export * from './update-goal.use-case';

import { CreateGoalUseCase } from './create-goal.use-case';
import { UpdateGoalUseCase } from './update-goal.use-case';

export const useCases = [CreateGoalUseCase, UpdateGoalUseCase];
