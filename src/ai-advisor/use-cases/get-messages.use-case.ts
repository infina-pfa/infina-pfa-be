import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { MessageRepository } from '../domain/repositories/message.repository';
import { MessageEntity } from '../domain/entities/message.entity';

export interface GetMessagesUseCaseInput {
  userId?: string;
  conversationId: string;
}

@Injectable()
export class GetMessagesUseCase extends BaseUseCase<
  GetMessagesUseCaseInput,
  MessageEntity[]
> {
  constructor(private readonly messageRepository: MessageRepository) {
    super();
  }

  async execute(input: GetMessagesUseCaseInput): Promise<MessageEntity[]> {
    return this.messageRepository.findMany({
      conversationId: input.conversationId,
      ...(input.userId && { userId: input.userId }),
    });
  }
}
