import { UserEntity } from '@/user/domain';
import { Injectable } from '@nestjs/common';
import { public_users as UserORM } from '../../../generated/prisma';
import { PrismaClient } from '../prisma/prisma-client';
import { PrismaDelegate } from '../types/prisma';
import { BaseRepository } from './base.repository';
import { PrismaRepository } from './prisma.repository';

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
      user_id: props.user_id,
      financial_stage: props.financial_stage,
      onboarding_completed_at: props.onboarding_completed_at
        ? new Date(props.onboarding_completed_at)
        : null,
      created_at: new Date(props.createdAt),
      updated_at: new Date(props.updatedAt),
    };
  }

  public toEntity(data: UserORM): UserEntity {
    return UserEntity.create(
      {
        name: data.name,
        user_id: data.user_id,
        financial_stage: data.financial_stage,
        onboarding_completed_at: data.onboarding_completed_at
          ? new Date(data.onboarding_completed_at)
          : null,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      },
      data.id,
    );
  }
}
