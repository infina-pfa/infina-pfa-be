import { Provider } from '@nestjs/common';

import { GetDebtsUseCase } from './get-debts.use-case';
import { GetDebtUseCase } from './get-debt.use-case';
import { PayDebtUseCase } from './pay-debt.use-case';
import { RemoveDebtPaymentUseCase } from './remove-debt-payment.use-case';
import { UpdateDebtUseCase } from './update-debt.use-case';

export {
  GetDebtsUseCase,
  GetDebtUseCase,
  PayDebtUseCase,
  RemoveDebtPaymentUseCase,
  UpdateDebtUseCase,
};

export const useCases: Provider[] = [
  GetDebtsUseCase,
  GetDebtUseCase,
  PayDebtUseCase,
  RemoveDebtPaymentUseCase,
  UpdateDebtUseCase,
];
