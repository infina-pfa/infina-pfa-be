import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';
import { TransactionType } from '@/common/types/transaction';
import { TransactionsWatchList } from '../watch-list/transactions.watch-list';
import { TransactionEntity } from './transactions.entity';

export interface IncomeProps extends BaseProps {
  userId: string;
  transactions: TransactionsWatchList;
}

export class IncomeAggregate extends BaseEntity<IncomeProps> {
  constructor(props: IncomeProps) {
    super(props);
  }

  public static create(
    props: Omit<IncomeProps, 'createdAt' | 'updatedAt'>,
  ): IncomeAggregate {
    return new IncomeAggregate({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get amount(): number {
    return this.props.transactions.items.reduce((acc, curr) => {
      return acc + curr.amount.value;
    }, 0);
  }

  addIncome(income: number, recurring: number, name: string): void {
    this.props.transactions.add(
      TransactionEntity.create({
        amount: new CurrencyVO(income),
        type: TransactionType.INCOME,
        description: 'Income',
        userId: this.props.userId,
        recurring,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
  }

  validate(): void {
    return;
  }
}
