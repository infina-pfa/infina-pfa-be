import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';
import { OptionalProps } from '@/common/utils';

export interface OnboardingProfileEntityProps extends BaseProps {
  userId: string;
  metadata: Record<string, any> | null;
  completedAt: Date | null;
  expense: CurrencyVO | null;
  income: CurrencyVO | null;
  deletedAt: Date | null;
  pyfAmount: CurrencyVO | null;
}

export class OnboardingProfileEntity extends BaseEntity<OnboardingProfileEntityProps> {
  public static create(
    props: OptionalProps<
      Omit<OnboardingProfileEntityProps, 'id'>,
      | 'createdAt'
      | 'updatedAt'
      | 'completedAt'
      | 'deletedAt'
      | 'metadata'
      | 'expense'
      | 'income'
      | 'pyfAmount'
    >,
    id?: string,
  ): OnboardingProfileEntity {
    return new OnboardingProfileEntity(
      {
        ...props,
        metadata: props.metadata ?? null,
        completedAt: props.completedAt ?? null,
        expense: props.expense ?? null,
        income: props.income ?? null,
        deletedAt: props.deletedAt ?? null,
        pyfAmount: props.pyfAmount ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }

  public validate(): void {
    if (!this.props.userId) {
      throw new Error('User ID is required');
    }
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get metadata(): Record<string, any> | null {
    return this.props.metadata;
  }

  public get completedAt(): Date | null {
    return this.props.completedAt;
  }

  public get expense(): CurrencyVO | null {
    return this.props.expense;
  }

  public get income(): CurrencyVO | null {
    return this.props.income;
  }

  public get pyfAmount(): CurrencyVO | null {
    return this.props.pyfAmount;
  }

  public get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  public complete(): void {
    this._props.completedAt = new Date();
    this.updated();
  }

  public isCompleted(): boolean {
    return !!this.props.completedAt;
  }

  public updateFinancialInfo(
    expense?: CurrencyVO,
    income?: CurrencyVO,
    pyfAmount?: CurrencyVO,
  ): void {
    if (expense !== undefined) {
      this._props.expense = expense;
    }
    if (income !== undefined) {
      this._props.income = income;
    }
    if (pyfAmount !== undefined) {
      this._props.pyfAmount = pyfAmount;
    }
    this.updated();
  }

  public updateMetadata(metadata: Record<string, any>): void {
    this._props.metadata = metadata;
    this.updated();
  }

  public delete(): void {
    this._props.deletedAt = new Date();
    this.updated();
  }
}
