import { DebtAggregate } from '../aggregates/debt.aggregate';
import { DebtEntityProps } from '../entities';

export abstract class DebtAggregateRepository {
  abstract save(entity: DebtAggregate): Promise<void>;
  abstract findById(id: string): Promise<DebtAggregate | null>;
  abstract findOne(
    props: Partial<Readonly<DebtEntityProps>>,
  ): Promise<DebtAggregate | null>;
}
