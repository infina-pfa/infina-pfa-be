import { FindManyOptions } from '@/common/types/query.types';
import {
  BudgetAggregate,
  BudgetAggregateProps,
} from '../entities/budget.aggregate';

export abstract class BudgetAggregateRepository {
  abstract save(entity: BudgetAggregate): Promise<void>;
  abstract findById(id: string): Promise<BudgetAggregate | null>;
  abstract findOne(
    props: Partial<Readonly<BudgetAggregateProps>>,
  ): Promise<BudgetAggregate | null>;
  abstract findMany(
    props: Partial<Readonly<BudgetAggregateProps>>,
    options?: FindManyOptions,
  ): Promise<BudgetAggregate[]>;
}
