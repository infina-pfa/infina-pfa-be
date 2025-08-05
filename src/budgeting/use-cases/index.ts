import { Provider } from '@nestjs/common';
import { AddIncomeUseCase } from './add-income.use-case';
import { CreateBudgetUseCase } from './create-budget.use-case';
import { DeleteBudgetUseCase } from './delete-budget.use-case';
import { DeleteSpendingUseCase } from './delete-spending.use-case';
import { GetBudgetDetailUseCase } from './get-budget-detail.use-case';
import { GetBudgetsUseCase } from './get-budgets.user-case';
import { GetIncomeByMonthUseCase } from './get-income-by-month.use-case';
import { GetMonthlySpendingUseCase } from './get-monthly-spending.use-case';
import { SpendUseCase } from './spend.use-case';
import { UpdateBudgetUseCase } from './update-budget.use-case';
import { UpdateIncomeUseCase } from './update-income.use-case';
import { RemoveIncomeUseCase } from './remove-income.use-case';

export const budgetingUseCases: Provider[] = [
  CreateBudgetUseCase,
  UpdateBudgetUseCase,
  GetBudgetsUseCase,
  GetBudgetDetailUseCase,
  GetMonthlySpendingUseCase,
  SpendUseCase,
  DeleteBudgetUseCase,
  DeleteSpendingUseCase,
  GetIncomeByMonthUseCase,
  AddIncomeUseCase,
  UpdateIncomeUseCase,
  RemoveIncomeUseCase,
];

export {
  AddIncomeUseCase,
  CreateBudgetUseCase,
  DeleteBudgetUseCase,
  DeleteSpendingUseCase,
  GetBudgetDetailUseCase,
  GetBudgetsUseCase,
  GetIncomeByMonthUseCase,
  GetMonthlySpendingUseCase,
  SpendUseCase,
  UpdateBudgetUseCase,
  UpdateIncomeUseCase,
  RemoveIncomeUseCase,
};
