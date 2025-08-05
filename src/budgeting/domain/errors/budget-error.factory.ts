import { NotFoundException } from '@nestjs/common';
import { AppError } from '@/common/errors/base';
import { BudgetErrorCode } from './budget-error-codes';

export class BudgetErrorFactory {
  static budgetNotFound(): NotFoundException {
    return new NotFoundException({
      code: BudgetErrorCode.BUDGET_NOT_FOUND,
      message: 'Budget not found',
    });
  }

  static budgetInvalidAmount(): AppError {
    return new AppError({
      code: BudgetErrorCode.BUDGET_INVALID_AMOUNT,
      message: 'Budget amount must be greater than 0',
    });
  }

  static spendingNotFound(): NotFoundException {
    return new NotFoundException({
      code: BudgetErrorCode.SPENDING_NOT_FOUND,
      message: 'Spending not found',
    });
  }
}
