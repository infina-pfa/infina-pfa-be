import { Provider } from '@nestjs/common';
import { CreateBudgetUseCase } from './create-budget.use-case';
import { DeleteBudgetUseCase } from './delete-budget.use-case';
import { DeleteSpendingUseCase } from './delete-spending.use-case';
import { GetBudgetDetailUseCase } from './get-budget-detail.use-case';
import { GetBudgetsUseCase } from './get-budgets.user-case';
import { GetMonthlySpendingUseCase } from './get-monthly-spending.use-case';
import { SpendUseCase } from './spend.use-case';
import { UpdateBudgetUseCase } from './update-budget.use-case';

export const budgetingUseCases: Provider[] = [
  CreateBudgetUseCase,
  UpdateBudgetUseCase,
  GetBudgetsUseCase,
  GetBudgetDetailUseCase,
  GetMonthlySpendingUseCase,
  SpendUseCase,
  DeleteBudgetUseCase,
  DeleteSpendingUseCase,
];

export {
  CreateBudgetUseCase,
  DeleteBudgetUseCase,
  DeleteSpendingUseCase,
  GetBudgetDetailUseCase,
  GetBudgetsUseCase,
  GetMonthlySpendingUseCase,
  SpendUseCase,
  UpdateBudgetUseCase,
};
