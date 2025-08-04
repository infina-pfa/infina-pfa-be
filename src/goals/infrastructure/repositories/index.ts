export * from './goal-aggregate.repository';
export * from './goal.repository';
export * from './transaction.repository';

import {
  GoalAggregateRepository,
  GoalRepository,
  TransactionRepository,
} from '@/goals/domain';
import { GoalAggregateRepositoryImpl } from './goal-aggregate.repository';
import { GoalRepositoryImpl } from './goal.repository';
import { TransactionRepositoryImpl } from './transaction.repository';

export const repositories = [
  {
    provide: GoalRepository,
    useClass: GoalRepositoryImpl,
  },
  {
    provide: TransactionRepository,
    useClass: TransactionRepositoryImpl,
  },
  {
    provide: GoalAggregateRepository,
    useClass: GoalAggregateRepositoryImpl,
  },
];
