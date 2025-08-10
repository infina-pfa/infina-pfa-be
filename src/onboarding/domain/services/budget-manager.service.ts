import { CurrencyVO } from '@/common/base';

export type BudgetCategory = 'fixed' | 'flexible';

export type CreateBudgetProps = {
  name: string;
  amount: CurrencyVO;
  category: BudgetCategory;
  color: string;
  icon: string;
  month: number;
  year: number;
};

export abstract class BudgetManagerService {
  abstract createBudgets(
    userId: string,
    props: CreateBudgetProps[],
  ): Promise<void>;
}
