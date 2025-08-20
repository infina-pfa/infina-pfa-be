import { Provider } from '@nestjs/common';

import { CreateDebtUseCase } from './create-debt.use-case';
import { GetDebtUseCase } from './get-debt.use-case';
import { GetDebtsUseCase } from './get-debts.use-case';
import { PayDebtUseCase } from './pay-debt.use-case';
import { RemoveDebtPaymentUseCase } from './remove-debt-payment.use-case';
import { RemoveDebtUseCase } from './remove-debt.use-case';
import { UpdateDebtUseCase } from './update-debt.use-case';

export {
  CreateDebtUseCase,
  GetDebtsUseCase,
  GetDebtUseCase,
  PayDebtUseCase,
  RemoveDebtPaymentUseCase,
  RemoveDebtUseCase,
  UpdateDebtUseCase,
};

export const useCases: Provider[] = [
  CreateDebtUseCase,
  GetDebtsUseCase,
  GetDebtUseCase,
  PayDebtUseCase,
  RemoveDebtPaymentUseCase,
  UpdateDebtUseCase,
  RemoveDebtUseCase,
];
