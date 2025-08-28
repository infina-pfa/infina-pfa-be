import { CurrencyVO } from '@/common/base';
import { DebtType } from '@/debt/domain';

export type CreateDebtProps = {
  lender: string;
  purpose: string;
  amount: CurrencyVO;
  rate: number;
  dueDate: Date;
  type: DebtType;
};

export abstract class DebtManagerService {
  abstract createDebts(userId: string, debts: CreateDebtProps[]): Promise<void>;
}
