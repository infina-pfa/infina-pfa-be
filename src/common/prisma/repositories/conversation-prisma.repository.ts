import { ConversationEntity } from '@/ai-advisor/domain';
import { BaseRepository } from '@/common/base/repositories/base.repository';
import { ConversationORM } from '@/common/types/orms';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../../generated/prisma';
import { PrismaRepository } from './prisma.repository';
import { PrismaDelegate } from '@/common/types';

@Injectable()
export class ConversationPrismaRepository
  extends PrismaRepository<ConversationEntity>
  implements BaseRepository<ConversationEntity>
{
  constructor(prismaClient: PrismaClient) {
    super(prismaClient.conversations as PrismaDelegate<ConversationORM>);
  }

  public toORM(entity: ConversationEntity): ConversationORM {
    const props = entity.props;
    return {
      id: entity.id,
      name: props.name,
      user_id: props.userId,
      created_at: props.createdAt,
      updated_at: props.updatedAt,
      deleted_at: props.deletedAt || null,
    };
  }

  public toEntity(data: ConversationORM): ConversationEntity {
    return ConversationEntity.create(
      {
        name: data.name,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
      },
      data.id,
    );
  }
}
