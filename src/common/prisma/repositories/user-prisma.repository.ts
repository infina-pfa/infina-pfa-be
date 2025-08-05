import { FinancialStage, UserEntity } from '@/user/domain';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../prisma-client';
import { PrismaDelegate } from '@/common/types/prisma';
import { PrismaRepository } from './prisma.repository';
import { UserORM } from '@/common/types/orms';
import { Currency, Language } from '@/common/types/user';
import { BaseRepository } from '@/common/base';

@Injectable()
export class UserPrismaRepository
  extends PrismaRepository<UserEntity>
  implements BaseRepository<UserEntity>
{
  constructor(prismaClient: PrismaClient) {
    super(prismaClient.public_users as PrismaDelegate<UserORM>);
  }

  public toORM(entity: UserEntity): UserORM {
    const props = entity.props;
    return {
      id: entity.id,
      name: props.name,
      user_id: props.userId,
      financial_stage: props.financialStage,
      onboarding_completed_at: props.onboardingCompletedAt
        ? new Date(props.onboardingCompletedAt)
        : null,
      created_at: new Date(props.createdAt),
      updated_at: new Date(props.updatedAt),
      currency: props.currency,
      language: props.language,
      deleted_at: null,
    };
  }

  public toEntity(data: UserORM): UserEntity {
    return UserEntity.create(
      {
        name: data.name,
        userId: data.user_id,
        financialStage: data.financial_stage as FinancialStage,
        onboardingCompletedAt: data.onboarding_completed_at
          ? new Date(data.onboarding_completed_at)
          : null,
        currency: data.currency as Currency,
        language: data.language as Language,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
      },
      data.id,
    );
  }
}
