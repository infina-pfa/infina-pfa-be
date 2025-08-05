import {
  budgets,
  transactions,
  public_users,
  goals,
  onboarding_profiles,
  onboarding_messages,
} from '../../../generated/prisma';

export type BudgetORM = budgets;
export type TransactionORM = transactions;
export type UserORM = public_users;
export type GoalORM = goals;
export type OnboardingProfileORM = onboarding_profiles;
export type OnboardingMessageORM = onboarding_messages;
