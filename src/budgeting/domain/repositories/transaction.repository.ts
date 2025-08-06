import { BaseRepository } from '@/common/base';
import { TransactionEntity } from '../entities/transactions.entity';
import { BudgetEntity } from '../entities/budget.entity';

export interface BudgetTransaction {
  transaction: TransactionEntity;
  budget: BudgetEntity;
}

export abstract class TransactionRepository extends BaseRepository<TransactionEntity> {
  abstract findBudgetSpendingByMonth(
    userId: string,
    month: number,
    year: number,
  ): Promise<BudgetTransaction[]>;
}
