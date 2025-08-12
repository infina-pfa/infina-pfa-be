import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import {
  MessageEntity,
  MessageSender,
  MessageType,
} from '../domain/entities/message.entity';
import { MessageRepository } from '../domain/repositories/message.repository';

export interface CreateMessageUseCaseInput {
  userId: string;
  conversationId: string;
  content: string | null;
  sender: MessageSender;
  metadata?: Record<string, any>;
  type: MessageType;
}

@Injectable()
export class CreateMessageUseCase extends BaseUseCase<
  CreateMessageUseCaseInput,
  MessageEntity
> {
  constructor(private readonly messageRepository: MessageRepository) {
    super();
  }

  async execute(input: CreateMessageUseCaseInput): Promise<MessageEntity> {
    const message = MessageEntity.create({
      userId: input.userId,
      conversationId: input.conversationId,
      content: input.content || null,
      sender: input.sender,
      metadata: input.metadata,
      type: input.type,
    });

    return this.messageRepository.create(message);
  }
}
