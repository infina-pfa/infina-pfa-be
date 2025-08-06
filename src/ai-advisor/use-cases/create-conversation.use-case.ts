import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { ConversationRepository } from '../domain/repositories/conversation.repository';
import { ConversationEntity } from '../domain/entities/conversation.entity';

export interface CreateConversationUseCaseInput {
  userId: string;
  name: string;
}

@Injectable()
export class CreateConversationUseCase extends BaseUseCase<
  CreateConversationUseCaseInput,
  ConversationEntity
> {
  constructor(private readonly conversationRepository: ConversationRepository) {
    super();
  }

  async execute(
    input: CreateConversationUseCaseInput,
  ): Promise<ConversationEntity> {
    const conversation = ConversationEntity.create({
      userId: input.userId,
      name: input.name,
    });

    return this.conversationRepository.create(conversation);
  }
}
