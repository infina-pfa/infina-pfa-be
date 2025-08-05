import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';
import { OptionalProp } from '@/common/utils/type';
import { BudgetErrorFactory } from '../errors/budget-error.factory';

export enum TransactionType {
  INCOME = 'income',
  BUDGET_SPENDING = 'budget_spending',
  GOAL_CONTRIBUTION = 'goal_contribution',
  GOAL_WITHDRAWAL = 'goal_withdrawal',
}

export interface TransactionEntityProps extends BaseProps {
  userId: string;
  amount: CurrencyVO;
  recurring: number;
  name: string;
  description: string;
  type: TransactionType;
  deletedAt?: Date | null;
}

export class TransactionEntity extends BaseEntity<TransactionEntityProps> {
  public static create(
    props: OptionalProp<
      TransactionEntityProps,
      'createdAt' | 'updatedAt' | 'deletedAt'
    >,
    id?: string,
  ): TransactionEntity {
    return new TransactionEntity(
      {
        ...props,
        deletedAt: props.deletedAt ?? null,
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
