import {
  DebtAggregateRepository,
  DebtPaymentRepository,
  DebtRepository,
} from '@/debt/domain';
import { Provider } from '@nestjs/common';
import { DebtAggregateRepositoryImpl } from './debt-aggregate.repository';
import { DebtPaymentRepositoryImpl } from './debt-payment.repository';
import { DebtRepositoryImpl } from './debt.repository';

export const repositories: Provider[] = [
  {
    provide: DebtRepository,
    useClass: DebtRepositoryImpl,
  },
  {
    provide: DebtPaymentRepository,
    useClass: DebtPaymentRepositoryImpl,
  },
  {
    provide: DebtAggregateRepository,
    useClass: DebtAggregateRepositoryImpl,
  },
];
