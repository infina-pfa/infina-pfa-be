import { FindManyOptions } from '@/common/types/query.types';
import { BudgetAggregate } from '../entities/budget.aggregate';
import { BudgetEntityProps } from '../entities/budget.entity';

export abstract class BudgetAggregateRepository {
  abstract save(entity: BudgetAggregate): Promise<void>;
  abstract findById(id: string): Promise<BudgetAggregate | null>;
  abstract findOne(
    props: Partial<Readonly<BudgetEntityProps>>,
  ): Promise<BudgetAggregate | null>;
  abstract findMany(
    props: Partial<Readonly<BudgetEntityProps>>,
    options?: FindManyOptions,
  ): Promise<BudgetAggregate[]>;
}
