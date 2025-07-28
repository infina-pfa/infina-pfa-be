import { BudgetAnalyticsService } from '@/budgeting/domain';
import { Provider } from '@nestjs/common';
import { BudgetAnalyticsServiceImpl } from './budget-analytics.service';

export const services: Provider[] = [
  {
    provide: BudgetAnalyticsService,
    useClass: BudgetAnalyticsServiceImpl,
  },
];