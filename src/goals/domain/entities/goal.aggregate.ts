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
    return this.props.contributions.items.reduce(
      (acc, contribution) => acc.add(contribution.amount),
      new CurrencyVO(0),
    );
  }

  public get targetAmount(): CurrencyVO | undefined {
    return this.props.goal.targetAmount;
  }

  public get remainingAmount(): CurrencyVO {
    if (!this.targetAmount) {
      return new CurrencyVO(0);
    }
    const remaining = this.targetAmount.subtract(this.totalContributed);
    return remaining.value < 0 ? new CurrencyVO(0) : remaining;
  }

  // Business methods
  public contribute(props: {
    amount: CurrencyVO;
    name?: string;
    description?: string;
    recurring?: number;
  }): void {
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

  public removeContribution(transaction: TransactionEntity): void {
    this.props.contributions.remove(transaction);
    // Update the goal's current amount after removal
    this.props.goal.updateProgress(this.totalContributed);
  }

  public updateContribution(transaction: TransactionEntity): void {
    this.props.contributions.update(transaction);
    // Update the goal's current amount after update
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
  }
}
