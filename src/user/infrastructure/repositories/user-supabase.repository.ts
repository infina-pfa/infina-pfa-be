import { Injectable } from '@nestjs/common';
import { Database, SupabaseRepository } from '@/common';
import { UserEntity, UserRepository } from '@/user/domain';

type UserORM = Database['public']['Tables']['users']['Row'];

@Injectable()
export class UserSupabaseRepository
  extends SupabaseRepository<UserEntity>
  implements UserRepository
{
  public get tableName() {
    return 'users' as const;
  }

  public toEntity(data: UserORM): UserEntity {
    return UserEntity.create(
      {
        name: data.name,
        user_id: data.user_id,
        budgeting_style: data.budgeting_style,
        financial_stage: data.financial_stage,
        onboarding_completed_at: data.onboarding_completed_at,
        total_asset_value: data.total_asset_value,
      },
      data.id,
    );
  }

  public toORM(entity: UserEntity): UserORM {
    return {
      id: entity.id,
      name: entity.name,
      user_id: entity.userId,
      budgeting_style: entity.budgetingStyle ?? null,
      financial_stage: entity.financialStage ?? null,
      onboarding_completed_at: entity.onboardingCompletedAt ?? null,
      total_asset_value: entity.totalAssetValue,
      created_at: entity.props.createdAt.toISOString(),
      updated_at: entity.props.updatedAt.toISOString(),
    };
  }
}
