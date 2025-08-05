import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';
import { TransactionsWatchList } from '../watch-list/transactions.watch-list';
import { BudgetEntity } from './budget.entity';
import { TransactionEntity, TransactionType } from './transactions.entity';

export interface BudgetAggregateProps {
  budget: BudgetEntity;
  spending: TransactionsWatchList;
}

export class BudgetAggregate extends BaseEntity<
  BudgetAggregateProps & BaseProps
> {
  public static create(
    props: BudgetAggregateProps,
    id?: string,
  ): BudgetAggregate {
    return new BudgetAggregate(
      {
        ...props,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
  }

  public validate(): void {
    this.props.budget.validate();
  }

  public get userId(): string {
    return this.props.budget.userId;
  }

  public get budget(): BudgetEntity {
    return this.props.budget;
  }

  public get spending(): TransactionEntity[] {
    return this.props.spending.items;
  }

  public get spent(): CurrencyVO {
    return this.props.spending.items.reduce(
      (acc, spending) => acc.add(spending.amount),
      new CurrencyVO(0),
    );
  }

  public get totalBudget(): CurrencyVO {
    return this.props.budget.amount;
  }

  public get remainingBudget(): CurrencyVO {
    return this.totalBudget.subtract(this.spent);
  }

  public spend(props: {
    amount: CurrencyVO;
    name?: string;
    description?: string;
    recurring?: number;
  }): void {
    this.props.spending.add(
      TransactionEntity.create({
        amount: props.amount,
        type: TransactionType.BUDGET_SPENDING,
        name: props.name || 'Spending',
        description:
          props.description || 'Spending for ' + this.props.budget.name,
        recurring: props.recurring || 0,
        userId: this.props.budget.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
  }

  public removeSpending(transaction: TransactionEntity): void {
    this.props.spending.remove(transaction);
  }

  public updateSpending(transaction: TransactionEntity): void {
    this.props.spending.update(transaction);
  }
}
