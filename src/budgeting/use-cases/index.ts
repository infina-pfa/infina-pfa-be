import { Provider } from '@nestjs/common';
import { CreateBudgetUseCase } from './create-budget.use-case';
import { GetBudgetDetailUseCase } from './get-budget-detail.use-case';
import { GetBudgetsUseCase } from './get-budgets.user-case';
import { GetMonthlySpendingUseCase } from './get-monthly-spending.use-case';
import { SpendUseCase } from './spend.use-case';
import { UpdateBudgetUseCase } from './update-budget.use-case';
import { DeleteBudgetUseCase } from './delete-budget.use-case';

export const budgetingUseCases: Provider[] = [
  CreateBudgetUseCase,
  UpdateBudgetUseCase,
  GetBudgetsUseCase,
  GetBudgetDetailUseCase,
  GetMonthlySpendingUseCase,
  SpendUseCase,
  DeleteBudgetUseCase,
];

export {
  CreateBudgetUseCase,
  UpdateBudgetUseCase,
  GetBudgetsUseCase,
  GetBudgetDetailUseCase,
  GetMonthlySpendingUseCase,
  SpendUseCase,
  DeleteBudgetUseCase,
};
