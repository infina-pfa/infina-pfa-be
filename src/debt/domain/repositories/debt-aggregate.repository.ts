import { FindManyOptions } from '@/common/types';
import { DebtAggregate } from '../aggregates/debt.aggregate';
import { DebtEntityProps } from '../entities';

export abstract class DebtAggregateRepository {
  abstract save(entity: DebtAggregate): Promise<void>;
  abstract findById(id: string): Promise<DebtAggregate | null>;
  abstract findOne(
    props: Partial<Readonly<DebtEntityProps>>,
  ): Promise<DebtAggregate | null>;
  abstract findMany(
    props: Partial<Readonly<DebtEntityProps>>,
    options?: FindManyOptions,
  ): Promise<DebtAggregate[]>;
  abstract delete(debtAggregate: DebtAggregate): Promise<void>;
}
