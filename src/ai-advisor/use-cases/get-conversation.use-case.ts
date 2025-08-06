import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { ConversationRepository } from '../domain/repositories/conversation.repository';
import { ConversationEntity } from '../domain/entities/conversation.entity';

export interface GetConversationUseCaseInput {
  userId?: string;
  conversationId: string;
}

@Injectable()
export class GetConversationUseCase extends BaseUseCase<
  GetConversationUseCaseInput,
  ConversationEntity
> {
  constructor(private readonly conversationRepository: ConversationRepository) {
    super();
  }

  async execute(
    input: GetConversationUseCaseInput,
  ): Promise<ConversationEntity> {
    const conversation = await this.conversationRepository.findById(
      input.conversationId,
    );

    if (
      !conversation ||
      (input.userId && conversation.userId !== input.userId)
    ) {
      throw new NotFoundException(
        `Conversation with id ${input.conversationId} not found`,
      );
    }

    return conversation;
  }
}
