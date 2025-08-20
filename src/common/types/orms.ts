import {
  budgets,
  transactions,
  public_users,
  goals,
  onboarding_profiles,
  onboarding_messages,
  conversations,
  messages,
  debts,
  transaction_type,
} from '../../../generated/prisma';

export type BudgetORM = budgets;
export type TransactionORM = transactions;
export type UserORM = public_users;
export type GoalORM = goals;
export type OnboardingProfileORM = onboarding_profiles;
export type OnboardingMessageORM = onboarding_messages;
export type ConversationORM = conversations;
export type MessageORM = messages;
export type DebtORM = debts;

export type TransactionTypeORM = transaction_type;
