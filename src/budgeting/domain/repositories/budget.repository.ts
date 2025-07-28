import { BaseRepository } from '@/common';
import { BudgetEntity } from '../entities/budget.entity';

export interface BudgetWithSpendingData {
  budget: BudgetEntity;
  totalSpent: number;
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
