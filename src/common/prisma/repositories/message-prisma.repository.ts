import { MessageEntity, MessageSender, MessageType } from '@/ai-advisor/domain';
import { BaseRepository } from '@/common/base/repositories/base.repository';
import { PrismaDelegate } from '@/common/types';
import { MessageORM } from '@/common/types/orms';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../../generated/prisma';
import { PrismaRepository } from './prisma.repository';

@Injectable()
export class MessagePrismaRepository
  extends PrismaRepository<MessageEntity>
  implements BaseRepository<MessageEntity>
{
  constructor(prismaClient: PrismaClient) {
    super(prismaClient.messages as PrismaDelegate<MessageORM>);
  }

  public toORM(entity: MessageEntity): MessageORM {
    const props = entity.props;
    return {
      id: entity.id,
      conversation_id: props.conversationId,
      sender: props.sender,
      type: props.type,
      content: props.content || null,
      metadata: props.metadata || null,
      user_id: props.userId,
      created_at: props.createdAt,
      updated_at: props.updatedAt,
      deleted_at: props.deletedAt || null,
    };
  }

  public toEntity(data: MessageORM): MessageEntity {
    return MessageEntity.create(
      {
        userId: data.user_id,
        conversationId: data.conversation_id,
        sender: data.sender as MessageSender,
        type: data.type as MessageType,
        content: data.content,
        metadata: data.metadata ? (data.metadata as Record<string, any>) : {},
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      },
      data.id,
    );
  }
}
