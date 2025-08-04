import {
  budgets,
  transactions,
  public_users,
  goals,
} from '../../../generated/prisma';

export type BudgetORM = budgets;
export type TransactionORM = transactions;
export type UserORM = public_users;
export type GoalORM = goals;
