import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';
import { OptionalProps } from '@/common/utils';
import { GoalErrorFactory } from '../errors/goal-error.factory';

export interface GoalEntityProps extends BaseProps {
  userId: string;
  title: string;
  description?: string;
  targetAmount?: CurrencyVO;
  currentAmount: CurrencyVO;
  dueDate?: Date;
  deletedAt?: Date | null;
}

export class GoalEntity extends BaseEntity<GoalEntityProps> {
  public static create(
    props: OptionalProps<
      Omit<GoalEntityProps, 'id'>,
      'createdAt' | 'updatedAt' | 'currentAmount' | 'deletedAt'
    >,
    id?: string,
  ): GoalEntity {
    return new GoalEntity(
      {
        ...props,
        currentAmount: props.currentAmount ?? new CurrencyVO(0),
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }

  public validate(): void {
    if (!this.props.title) {
      throw GoalErrorFactory.invalidGoal('Title is required');
    }
    if (!this.props.targetAmount) {
      throw GoalErrorFactory.invalidGoal('Target amount is required');
    }
    if (this.props.targetAmount.value <= 0) {
      throw GoalErrorFactory.invalidGoal('Target amount must be positive');
    }
    if (this.props.currentAmount.value < 0) {
      throw GoalErrorFactory.invalidGoal('Current amount must be positive');
    }
    if (this.props.dueDate && this.props.dueDate < new Date()) {
      throw GoalErrorFactory.invalidGoal('Due date must be in the future');
    }
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get title(): string {
    return this.props.title;
  }

  public get description(): string | undefined {
    return this.props.description;
  }

  public get targetAmount(): CurrencyVO | undefined {
    return this.props.targetAmount;
  }

  public get currentAmount(): CurrencyVO {
    return this.props.currentAmount;
  }

  public get dueDate(): Date | undefined {
    return this.props.dueDate;
  }

  public update(
    props: Omit<
      Partial<GoalEntityProps>,
      'createdAt' | 'updatedAt' | 'userId' | 'currentAmount'
    >,
  ): void {
    this._props = {
      ...this._props,
      ...props,
    };
    this.updated();
  }

  public updateProgress(amount: CurrencyVO): void {
    this._props = {
      ...this._props,
      currentAmount: amount,
    };
    this.updated();
  }

  public isCompleted(): boolean {
    if (!this.props.targetAmount) {
      return false;
    }
    return this.props.currentAmount.value >= this.props.targetAmount.value;
  }

  public isOverdue(): boolean {
    if (!this.props.dueDate) {
      return false;
    }
    return new Date() > this.props.dueDate && !this.isCompleted();
  }
}
