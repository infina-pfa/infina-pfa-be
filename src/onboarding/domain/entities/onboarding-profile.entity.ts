import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';
import { OptionalProps } from '@/common/utils';
import { OnboardingErrorFactory } from '../errors';

export enum BudgetingStyle {
  DETAIL_TRACKER = 'detail_tracker',
  GOAL_FOCUSED = 'goal_focused',
}

export type Metadata = {
  goalDetails: {
    amount: number;
    monthlyTarget: number;
  };
  expenseBreakdown: Record<string, number>;
};

export type PyfMetadata = {
  reasonNotPyf: string;
  reminderDate: string;
};

export interface OnboardingProfileEntityProps extends BaseProps {
  userId: string;
  metadata: Metadata | null;
  completedAt: Date | null;
  expense: CurrencyVO | null;
  income: CurrencyVO | null;
  deletedAt: Date | null;
  pyfAmount: CurrencyVO | null;
  budgetingStyle: BudgetingStyle | null;
  pyfMetadata: PyfMetadata | null;
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
      | 'budgetingStyle'
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
        budgetingStyle: props.budgetingStyle ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }

  public validate(): void {
    if (this.props.expense && this.props.expense.value < 0) {
      throw OnboardingErrorFactory.profileInvalidAmount();
    }

    if (this.props.income && this.props.income.value < 0) {
      throw OnboardingErrorFactory.profileInvalidAmount();
    }

    if (this.props.pyfAmount && this.props.pyfAmount.value < 0) {
      throw OnboardingErrorFactory.profileInvalidAmount();
    }
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get metadata(): Metadata | null {
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

  public get pyfMetadata(): PyfMetadata | null {
    return this.props.pyfMetadata;
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

  public updateBudgetingStyle(budgetingStyle: BudgetingStyle): void {
    this._props.budgetingStyle = budgetingStyle;
    this.updated();
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

  public updateMetadata(metadata: Metadata): void {
    this._props.metadata = metadata;
    this.updated();
  }

  public delete(): void {
    this._props.deletedAt = new Date();
    this.updated();
  }
}
