import { BaseRepository } from '@/common/base';
import { TransactionEntity } from '../entities/transactions.entity';

export abstract class TransactionRepository extends BaseRepository<TransactionEntity> {
  abstract findBudgetSpendingByMonth(
    userId: string,
    month: number,
    year: number,
  ): Promise<TransactionEntity[]>;
}
