import { Provider } from '@nestjs/common';
import { CreateBudgetUseCase } from './create-budget.use-case';
import { GetBudgetsUseCase } from './get-budgets.user-case';
import { UpdateBudgetUseCase } from './update-budget.use-case';

export const budgetingUseCases: Provider[] = [
  CreateBudgetUseCase,
  UpdateBudgetUseCase,
  GetBudgetsUseCase,
];
