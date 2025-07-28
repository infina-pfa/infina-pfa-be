import { BudgetTransactionAggregate } from '../entities/budget-transaction.aggregate';

export abstract class BudgetTransactionRepository {
  abstract findOne(
    userId: string,
    budgetId: string,
  ): Promise<BudgetTransactionAggregate | null>;
}
