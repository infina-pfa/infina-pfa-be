import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';
import {
  TransactionEntity,
  TransactionType,
} from '@/budgeting/domain/entities/transactions.entity';
import { GoalTransactionsWatchList } from '../watch-list/goal-transactions.watch-list';
import { GoalEntity } from './goal.entity';

export interface GoalAggregateProps {
  goal: GoalEntity;
  contributions: GoalTransactionsWatchList;
}

export class GoalAggregate extends BaseEntity<GoalAggregateProps & BaseProps> {
  public static create(props: GoalAggregateProps, id?: string): GoalAggregate {
    return new GoalAggregate(
      {
        ...props,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
  }

  public validate(): void {
    this.props.goal.validate();
    this.props.contributions.items.forEach((transaction) => {
      transaction.validate();
    });
  }

  public get userId(): string {
    return this.props.goal.userId;
  }

  public get goal(): GoalEntity {
    return this.props.goal;
  }

  public get contributions(): TransactionEntity[] {
    return this.props.contributions.items;
  }

  // Computed properties
  public get totalContributed(): CurrencyVO {
    const transactions = this.props.contributions.items;

    // If no transactions, return zero in the goal's currency (or VND if no target amount)
    if (transactions.length === 0) {
      const currency =
        this.props.goal.targetAmount?.currency ||
        this.props.goal.currentAmount.currency;
      return new CurrencyVO(0, currency);
    }

    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.props.type === TransactionType.INCOME) {
          return acc.add(transaction.amount);
        } else if (transaction.props.type === TransactionType.OUTCOME) {
          return acc.subtract(transaction.amount);
        }
        return acc;
      },
      new CurrencyVO(0, transactions[0].amount.currency),
    );
  }

  public get targetAmount(): CurrencyVO | undefined {
    return this.props.goal.targetAmount;
  }

  public get remainingAmount(): CurrencyVO {
    if (!this.targetAmount) {
      const currency = this.props.goal.currentAmount.currency;
      return new CurrencyVO(0, currency);
    }
    const remaining = this.targetAmount.subtract(this.totalContributed);
    return remaining.value < 0
      ? new CurrencyVO(0, this.targetAmount.currency)
      : remaining;
  }

  // Business methods
  public contribute(props: {
    amount: CurrencyVO;
    name?: string;
    description?: string;
    recurring?: number;
  }): void {
    // Validate that amount is positive
    if (props.amount.value <= 0) {
      throw new Error('Contribution amount must be positive');
    }

    this.props.contributions.add(
      TransactionEntity.create({
        amount: props.amount,
        type: TransactionType.INCOME,
        name: props.name || 'Goal Contribution',
        description:
          props.description || 'Contribution to ' + this.props.goal.title,
        recurring: props.recurring || 0,
        userId: this.props.goal.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    // Update the goal's current amount
    this.props.goal.updateProgress(this.totalContributed);
  }

  public withdraw(props: {
    amount: CurrencyVO;
    name?: string;
    description?: string;
    recurring?: number;
  }): void {
    // Validate that amount is positive
    if (props.amount.value <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    this.props.contributions.add(
      TransactionEntity.create({
        amount: props.amount,
        type: TransactionType.OUTCOME,
        name: props.name || 'Goal Withdrawal',
        description:
          props.description || 'Withdrawal from ' + this.props.goal.title,
        recurring: props.recurring || 0,
        userId: this.props.goal.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    // Update the goal's current amount
    this.props.goal.updateProgress(this.totalContributed);
  }

  public updateGoalDetails(props: {
    title?: string;
    description?: string;
    targetAmount?: CurrencyVO;
    dueDate?: Date;
  }): void {
    this.props.goal.update(props);
    this.updated();
    this.validate();
  }
}
