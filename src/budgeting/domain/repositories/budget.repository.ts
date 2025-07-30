import { BaseRepository } from '@/common';
import { BudgetEntity } from '../entities/budget.entity';
import { CurrencyVO } from '@/common/value-objects';

export interface BudgetWithSpendingData {
  budget: BudgetEntity;
  totalSpent: CurrencyVO;
  transactionCount: number;
}

export abstract class BudgetRepository extends BaseRepository<BudgetEntity> {
  abstract findManyByMonth(
    userId: string,
    month: number,
    year: number,
  ): Promise<BudgetEntity[]>;

  abstract findManyWithSpending(
    userId: string,
    month: number,
    year: number,
  ): Promise<BudgetWithSpendingData[]>;
}
