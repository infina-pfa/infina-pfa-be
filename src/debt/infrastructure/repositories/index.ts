import { Provider } from '@nestjs/common';
import { DebtRepositoryImpl } from './debt.repository';
import { DebtPaymentRepositoryImpl } from './debt-payment.repository';
import { DebtPaymentRepository, DebtRepository } from '@/debt/domain';

export const repositories: Provider[] = [
  {
    provide: DebtRepository,
    useClass: DebtRepositoryImpl,
  },
  {
    provide: DebtPaymentRepository,
    useClass: DebtPaymentRepositoryImpl,
  },
];
