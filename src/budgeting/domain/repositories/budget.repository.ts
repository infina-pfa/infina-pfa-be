import { BaseRepository } from '@/common';
import { BudgetEntity } from '../entities/budget.entity';

export abstract class BudgetRepository extends BaseRepository<BudgetEntity> {
  abstract findManyByMonth(
    userId: string,
    month: number,
    year: number,
  ): Promise<BudgetEntity[]>;
}
