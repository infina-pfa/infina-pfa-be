import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';
import { OptionalProps } from '@/common/utils';
import { BudgetErrorFactory } from '../errors';

export enum BudgetCategory {
  FIXED = 'fixed',
  FLEXIBLE = 'flexible',
}

export interface BudgetEntityProps extends BaseProps {
  name: string;
  amount: CurrencyVO;
  userId: string;
  category: BudgetCategory;
  color: string;
  icon: string;
  month: number;
  year: number;
  deletedAt: Date | null;
}

export class BudgetEntity extends BaseEntity<BudgetEntityProps> {
  public static create(
    props: OptionalProps<
      Omit<BudgetEntityProps, 'id'>,
      'createdAt' | 'updatedAt' | 'deletedAt'
    >,
    id?: string,
  ): BudgetEntity {
    if (props.amount.value < 0) {
      throw BudgetErrorFactory.budgetInvalidAmount();
    }

    return new BudgetEntity(
      {
        ...props,
        deletedAt: props.deletedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }

  public validate(): void {
    if (this.props.amount.value < 0) {
      throw BudgetErrorFactory.budgetInvalidAmount();
    }
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get amount(): CurrencyVO {
    return this.props.amount;
  }

  public get name(): string {
    return this.props.name;
  }

  public update(
    props: Omit<
      Partial<BudgetEntityProps>,
      'createdAt' | 'updatedAt' | 'userId' | 'amount'
    >,
  ): void {
    this._props = {
      ...this._props,
      ...props,
    };
    this.updated();
  }

  public delete(): void {
    this._props.deletedAt = new Date();
    this.updated();
  }

  public isArchived(): boolean {
    return !!this.props.deletedAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }
}
