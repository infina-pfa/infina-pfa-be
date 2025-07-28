import { Provider } from '@nestjs/common';
import { CreateBudgetUseCase } from './create-budget.use-case';
import { GetBudgetsUseCase } from './get-budgets.user-case';
import { GetBudgetsWithSpendingUseCase } from './get-budgets-with-spending.use-case';

export const budgetingUseCases: Provider[] = [
  CreateBudgetUseCase,
  GetBudgetsUseCase,
  GetBudgetsWithSpendingUseCase,
];
