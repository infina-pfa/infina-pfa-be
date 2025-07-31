import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';
import { OptionalProps } from '@/common/utils';

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
  archivedAt: Date | null;
}

export class BudgetEntity extends BaseEntity<BudgetEntityProps> {
  public static create(
    props: OptionalProps<
      Omit<BudgetEntityProps, 'id'>,
      'createdAt' | 'updatedAt' | 'archivedAt'
    >,
    id?: string,
  ): BudgetEntity {
    if (props.amount.value <= 0) {
      throw new Error('Budget amount must be greater than 0');
    }

    return new BudgetEntity(
      {
        ...props,
        archivedAt: props.archivedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
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

  public archive(): void {
    this._props.archivedAt = new Date();
    this.updated();
  }

  public isArchived(): boolean {
    return !!this.props.archivedAt;
  }

  get archivedAt(): Date | null {
    return this.props.archivedAt;
  }
}
