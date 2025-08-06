import {
  AiAdvisorService,
  MessageEntity,
  MessageRepository,
  MessageSender,
} from '@/ai-advisor/domain';
import {
  AiInternalService,
  AiStreamConversationMessageRole,
  AiStreamFlowType,
} from '@/common/internal-services';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AiAdvisorServiceImpl extends AiAdvisorService {
  constructor(
    private readonly aiInternalService: AiInternalService,
    private readonly messageRepository: MessageRepository,
  ) {
    super();
  }

  async stream(
    userId: string,
    conversationId: string,
    message: string,
  ): Promise<ReadableStream> {
    const messages = await this.messageRepository.findMany({
      conversationId,
      userId,
    });

    const userMessage = MessageEntity.createUserMessage({
      userId,
      conversationId,
      content: message,
    });

    await this.messageRepository.create(userMessage);

    const stream = await this.aiInternalService.stream(
      userId,
      message,
      messages.map((message) => ({
        role:
          message.sender === MessageSender.AI
            ? AiStreamConversationMessageRole.ASSISTANT
            : AiStreamConversationMessageRole.USER,
        content: message.content,
      })),
      AiStreamFlowType.CHAT,
    );

    return stream;
  }
}
