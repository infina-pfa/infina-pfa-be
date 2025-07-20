import { BudgetingStyle, UserEntity } from '@/user/domain';
import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { public_users as UserORM } from '../../../generated/prisma';
import { PrismaClient } from '../prisma/prisma-client';
import { PrismaDelegate } from '../types/prisma';
import { PrismaRepository } from './prisma.repository';

@Injectable()
export class UserPrismaRepository extends PrismaRepository<UserEntity> {
  constructor(prismaClient: PrismaClient) {
    super(prismaClient.public_users as PrismaDelegate<UserORM>);
  }

  public toORM(entity: UserEntity): UserORM {
    const props = entity.props;
    return {
      id: entity.id,
      name: props.name,
      user_id: props.user_id,
      budgeting_style: props.budgeting_style,
      financial_stage: props.financial_stage,
      onboarding_completed_at: props.onboarding_completed_at
        ? new Date(props.onboarding_completed_at)
        : null,
      total_asset_value: new Decimal(props.total_asset_value),
      created_at: new Date(props.createdAt),
      updated_at: new Date(props.updatedAt),
    };
  }

  public toEntity(data: UserORM): UserEntity {
    return UserEntity.create(
      {
        name: data.name,
        user_id: data.user_id,
        budgeting_style: data.budgeting_style as BudgetingStyle,
        financial_stage: data.financial_stage,
        onboarding_completed_at: data.onboarding_completed_at
          ? new Date(data.onboarding_completed_at)
          : null,
        total_asset_value: data.total_asset_value.toNumber(),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      },
      data.id,
    );
  }
}
