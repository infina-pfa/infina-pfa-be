import {
  BudgetAggregateRepository,
  BudgetRepository,
  IncomeRepository,
  TransactionRepository,
} from '@/budgeting/domain';
import { Provider } from '@nestjs/common';
import { BudgetAggregateRepositoryImpl } from './budget-aggregate.repository';
import { BudgetRepositoryImpl } from './budget.repository';
import { TransactionRepositoryImpl } from './transaction.repository';
import { IncomeRepositoryImpl } from './income.repository';

export const repositories: Provider[] = [
  {
    provide: BudgetRepository,
    useClass: BudgetRepositoryImpl,
  },
  {
    provide: TransactionRepository,
    useClass: TransactionRepositoryImpl,
  },
  {
    provide: BudgetAggregateRepository,
    useClass: BudgetAggregateRepositoryImpl,
  },
  {
    provide: IncomeRepository,
    useClass: IncomeRepositoryImpl,
  },
];
