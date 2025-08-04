import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';
import { OptionalProp } from '@/common/utils/type';
import { BudgetErrorFactory } from '../errors/budget-error.factory';

export enum TransactionType {
  INCOME = 'income',
  OUTCOME = 'outcome',
  TRANSFER = 'transfer',
}

export interface TransactionEntityProps extends BaseProps {
  userId: string;
  amount: CurrencyVO;
  recurring: number;
  name: string;
  description: string;
  type: TransactionType;
}

export class TransactionEntity extends BaseEntity<TransactionEntityProps> {
  public static create(
    props: OptionalProp<TransactionEntityProps, 'createdAt' | 'updatedAt'>,
    id?: string,
  ): TransactionEntity {
    return new TransactionEntity(
      {
        ...props,
      },
      id,
    );
  }

  public validate(): void {
    if (this.props.amount.value <= 0) {
      throw BudgetErrorFactory.budgetInvalidAmount();
    }
  }

  public get amount(): CurrencyVO {
    return this.props.amount;
  }
}
