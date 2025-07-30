import { BaseEntity, BaseProps } from '@/common/entities/base.entity';
import { Currency, Language } from '@/common/types/user';

export enum BudgetingStyle {
  DETAIL_TRACKER = 'detail_tracker',
  GOAL_FOCUSED = 'goal_focused',
}

export enum FinancialStage {
  DEBT = 'debt',
  START_SAVING = 'start_saving',
  START_INVESTING = 'start_investing',
}

export interface UserEntityProps extends BaseProps {
  name: string;
  userId: string;
  financialStage: FinancialStage | null;
  onboardingCompletedAt: Date | null;
  currency: Currency;
  language: Language;
}

export class UserEntity extends BaseEntity<UserEntityProps> {
  public static create(
    props: Omit<UserEntityProps, 'id'>,
    id?: string,
  ): UserEntity {
    return new UserEntity(
      {
        ...props,
      },
      id,
    );
  }

  public updateName(name: string): void {
    this._props.name = name;
    this.updated();
  }

  public setFinancialStage(stage: FinancialStage): void {
    this._props.financialStage = stage;
    this.updated();
  }

  public completeOnboarding(): void {
    this._props.onboardingCompletedAt = new Date();
    this.updated();
  }

  public updateCurrency(currency: Currency): void {
    this._props.currency = currency;
    this.updated();
  }

  public updateLanguage(language: Language): void {
    this._props.language = language;
    this.updated();
  }

  public isOnboardingCompleted(): boolean {
    return !!this.props.onboardingCompletedAt;
  }

  get name(): string {
    return this.props.name;
  }

  get userId(): string {
    return this.props.userId;
  }

  get financialStage(): string | null | undefined {
    return this.props.financialStage;
  }

  get onboardingCompletedAt(): Date | null | undefined {
    return this.props.onboardingCompletedAt;
  }

  get currency(): string {
    return this.props.currency;
  }

  get language(): string {
    return this.props.language;
  }
}
