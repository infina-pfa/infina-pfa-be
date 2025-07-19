import { BaseEntity, BaseProps } from '@/common';
import type { Enums } from '@/common/types/database';

export interface UserEntityProps extends BaseProps {
  name: string;
  user_id: string;
  budgeting_style?: Enums<'budgeting_style'> | null;
  financial_stage?: string | null;
  onboarding_completed_at?: string | null;
  total_asset_value: number;
}

export class UserEntity extends BaseEntity<UserEntityProps> {
  public static create(
    props: Omit<UserEntityProps, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string,
  ): UserEntity {
    return new UserEntity(
      {
        ...props,
        total_asset_value: props.total_asset_value ?? 0,
      },
      id,
    );
  }

  public setBudgetingStyle(style: Enums<'budgeting_style'>): void {
    this._props.budgeting_style = style;
    this._props.updatedAt = new Date();
  }

  public setFinancialStage(stage: string): void {
    this._props.financial_stage = stage;
    this._props.updatedAt = new Date();
  }

  public completeOnboarding(): void {
    this._props.onboarding_completed_at = new Date().toISOString();
    this._props.updatedAt = new Date();
  }

  public updateTotalAssetValue(value: number): void {
    this._props.total_asset_value = value;
    this._props.updatedAt = new Date();
  }

  public isOnboardingCompleted(): boolean {
    return !!this.props.onboarding_completed_at;
  }

  get name(): string {
    return this.props.name;
  }

  get userId(): string {
    return this.props.user_id;
  }

  get budgetingStyle(): Enums<'budgeting_style'> | null | undefined {
    return this.props.budgeting_style;
  }

  get financialStage(): string | null | undefined {
    return this.props.financial_stage;
  }

  get onboardingCompletedAt(): string | null | undefined {
    return this.props.onboarding_completed_at;
  }

  get totalAssetValue(): number {
    return this.props.total_asset_value;
  }
}
