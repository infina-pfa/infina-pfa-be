import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';

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
    props: Omit<BudgetEntityProps, 'id'>,
    id?: string,
  ): BudgetEntity {
    // Business rule: Amount must be greater than 0
    if (props.amount.value <= 0) {
      throw new Error('Budget amount must be greater than 0');
    }

    return new BudgetEntity(
      {
        ...props,
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

  public archive(): void {
    this._props.archivedAt = new Date();
    this.updated();
  }

  public unarchive(): void {
    this._props.archivedAt = null;
    this.updated();
  }

  public isArchived(): boolean {
    return !!this.props.archivedAt;
  }

  get archivedAt(): Date | null {
    return this.props.archivedAt;
  }
}
