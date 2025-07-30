import { BaseEntity, BaseProps } from '@/common/entities/base.entity';

export enum BudgetingStyle {
  DETAIL_TRACKER = 'detail_tracker',
  GOAL_FOCUSED = 'goal_focused',
}

export interface UserEntityProps extends BaseProps {
  name: string;
  userId: string;
  financialStage: string | null;
  onboardingCompletedAt: Date | null;
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

  public setFinancialStage(stage: string): void {
    this._props.financialStage = stage;
    this._props.updatedAt = new Date();
  }

  public completeOnboarding(): void {
    this._props.onboardingCompletedAt = new Date();
    this._props.updatedAt = new Date();
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
}
