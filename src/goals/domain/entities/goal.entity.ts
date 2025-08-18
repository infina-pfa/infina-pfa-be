import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';
import { OptionalProps } from '@/common/utils';
import { GoalErrorFactory } from '../errors/goal-error.factory';

export enum GoalType {
  EMERGENCY = 'emergency',
  GROWTH = 'growth',
}

export interface GoalEntityProps extends BaseProps {
  userId: string;
  title: string;
  description?: string;
  targetAmount?: CurrencyVO;
  dueDate?: Date;
  deletedAt?: Date | null;
  type: GoalType;
}

export class GoalEntity extends BaseEntity<GoalEntityProps> {
  public static create(
    props: OptionalProps<
      Omit<GoalEntityProps, 'id'>,
      'createdAt' | 'updatedAt' | 'deletedAt'
    >,
    id?: string,
  ): GoalEntity {
    return new GoalEntity(
      {
        ...props,
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

  public get dueDate(): Date | undefined {
    return this.props.dueDate;
  }

  public update(
    props: Omit<Partial<GoalEntityProps>, 'createdAt' | 'updatedAt' | 'userId'>,
  ): void {
    this._props = {
      ...this._props,
      ...props,
    };
    this.updated();
  }

  public isOverdue(): boolean {
    if (!this.props.dueDate) {
      return false;
    }
    return new Date() > this.props.dueDate;
  }
}
