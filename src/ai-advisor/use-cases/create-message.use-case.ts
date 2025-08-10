import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { MessageEntity } from '../domain/entities/message.entity';
import { MessageRepository } from '../domain/repositories/message.repository';

export interface CreateMessageUseCaseInput {
  userId: string;
  conversationId: string;
  content: string | null;
  metadata?: Record<string, any>;
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
    const message = MessageEntity.createUserMessage({
      userId: input.userId,
      conversationId: input.conversationId,
      content: input.content || null,
    });

    return this.messageRepository.create(message);
  }
}
