export enum BudgetErrorCode {
  // Budget errors
  BUDGET_NOT_FOUND = 'BUDGET_NOT_FOUND',
  BUDGET_INVALID_AMOUNT = 'BUDGET_INVALID_AMOUNT',

  // Spending errors
  SPENDING_NOT_FOUND = 'SPENDING_NOT_FOUND',

  // Income errors
  INCOME_NOT_FOUND = 'INCOME_NOT_FOUND',

  // Budget already exists
  BUDGET_ALREADY_EXISTS = 'BUDGET_ALREADY_EXISTS',

  // Budget not belong to user
  BUDGET_NOT_BELONG_TO_USER = 'BUDGET_NOT_BELONG_TO_USER',
}
