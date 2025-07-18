import { Provider } from '@nestjs/common';
import { BudgetRepositoryImpl } from './budget.repository';
import { BudgetRepository } from '@/budgeting/domain';

export const repositories: Provider[] = [
  {
    provide: BudgetRepository,
    useClass: BudgetRepositoryImpl,
  },
];
