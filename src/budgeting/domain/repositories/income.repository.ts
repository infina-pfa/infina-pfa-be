import { IncomeAggregate } from '../entities/income.aggregate';

export abstract class IncomeRepository {
  abstract add(income: IncomeAggregate): Promise<void>;

  abstract remove(income: IncomeAggregate): Promise<void>;

  abstract findByMonth(
    userId: string,
    month: number,
    year: number,
  ): Promise<IncomeAggregate | null>;
}
