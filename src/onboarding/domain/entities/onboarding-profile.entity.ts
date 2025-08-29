import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';
import { OptionalProps } from '@/common/utils';
import { OnboardingErrorFactory } from '../errors';
import { v4 as uuidv4 } from 'uuid';

export enum BudgetingStyle {
  DETAIL_TRACKER = 'detail_tracker',
  GOAL_FOCUSED = 'goal_focused',
}

export enum DebtType {
  BAD_DEBT = 'bad_debt',
  GOOD_DEBT = 'good_debt',
}

export type DebtDetails = {
  lender: string;
  purpose: string;
  rate: number;
  dueDate: string;
  amount: number;
  currentPaidAmount: number;
  type: DebtType;
  sessionId: string;
};

export type Metadata = {
  goalDetails: {
    amount: number;
    monthlyTarget: number;
    timeframe: number;
  };
  debts: DebtDetails[];
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
  sessionId: string;
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
      | 'pyfMetadata'
      | 'sessionId'
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
        pyfMetadata: props.pyfMetadata ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
        sessionId: props.sessionId ?? uuidv4(),
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
    this._props.metadata = {
      ...this._props.metadata,
      ...metadata,
    };
    this.updated();
  }

  public updatePyfMetadata(pyfMetadata: PyfMetadata): void {
    this._props.pyfMetadata = {
      ...this._props.pyfMetadata,
      ...pyfMetadata,
    };
    this.updated();
  }

  public resetPyfMetadata(): void {
    this._props.pyfMetadata = null;
    this.updated();
  }

  public resetProfile(): void {
    this._props.metadata = null;
    this._props.expense = null;
    this._props.income = null;
    this._props.pyfAmount = null;
    this._props.budgetingStyle = null;
    this._props.pyfMetadata = null;
    this._props.completedAt = null;
    this._props.sessionId = uuidv4();
    this.updated();
  }

  public delete(): void {
    this._props.deletedAt = new Date();
    this.updated();
  }

  public get sessionId(): string {
    return this.props.sessionId;
  }
}
