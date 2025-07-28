import { BaseEntity, BaseProps } from '@/common/entities/base.entity';
import { TransactionEntity } from './transactions.entity';
import { BudgetEntity } from './budget.entity';

export interface BudgetTransactionAggregateProps extends BaseProps {
  budget: BudgetEntity;
  userId: string;
  transactions: TransactionEntity[];
}

export class BudgetTransactionAggregate extends BaseEntity<BudgetTransactionAggregateProps> {
  public static create(
    props: Omit<BudgetTransactionAggregateProps, 'id'>,
    id?: string,
  ): BudgetTransactionAggregate {
    return new BudgetTransactionAggregate(props, id);
  }
}
