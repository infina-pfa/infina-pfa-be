import { FindManyOptions } from '@/common/types/query.types';
import { GoalAggregate } from '../entities/goal.aggregate';
import { GoalEntityProps } from '../entities/goal.entity';

export abstract class GoalAggregateRepository {
  abstract save(entity: GoalAggregate): Promise<void>;
  abstract findById(id: string): Promise<GoalAggregate | null>;
  abstract findOne(
    props: Partial<Readonly<GoalEntityProps>>,
  ): Promise<GoalAggregate | null>;
  abstract findMany(
    props: Partial<Readonly<GoalEntityProps>>,
    options?: FindManyOptions,
  ): Promise<GoalAggregate[]>;
}
