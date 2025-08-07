import {
  OnboardingMessageEntity,
  OnboardingMessageEntityProps,
  OnboardingMessageSender,
} from '@/onboarding/domain';
import { PrismaRepository } from './prisma.repository';
import { PrismaClient } from '../prisma-client';
import { OnboardingMessageORM } from '@/common/types/orms';
import { PrismaDelegate } from '@/common/types/prisma';
import { Injectable } from '@nestjs/common';
import { FindManyOptions } from '../../types/query.types';
import { BaseRepository } from '../../base/repositories/base.repository';

@Injectable()
export class OnboardingMessagePrismaRepository
  extends PrismaRepository<OnboardingMessageEntity>
  implements BaseRepository<OnboardingMessageEntity>
{
  constructor(prismaClient: PrismaClient) {
    super(
      prismaClient.onboarding_messages as PrismaDelegate<OnboardingMessageORM>,
    );
  }

  public toORM(entity: OnboardingMessageEntity): OnboardingMessageORM {
    const props = entity.props;
    return {
      id: entity.id,
      user_id: props.userId,
      sender: props.sender,
      content: props.content,
      component_id: props.componentId,
      metadata: props.metadata,
      created_at: props.createdAt,
      updated_at: props.updatedAt,
      deleted_at: props.deletedAt,
    };
  }

  public toEntity(data: OnboardingMessageORM): OnboardingMessageEntity {
    return OnboardingMessageEntity.create(
      {
        userId: data.user_id,
        sender: data.sender as OnboardingMessageSender,
        content: data.content,
        componentId: data.component_id,
        metadata: data.metadata as Record<string, any> | null,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
      },
      data.id,
    );
  }

  public override async findOne(
    props: Partial<Readonly<OnboardingMessageEntityProps>>,
  ): Promise<OnboardingMessageEntity | null> {
    return super.findOne({ ...props });
  }

  public override async findMany(
    props: Partial<Readonly<OnboardingMessageEntityProps>>,
    options?: FindManyOptions,
  ): Promise<OnboardingMessageEntity[]> {
    return super.findMany({ ...props }, options);
  }
}
