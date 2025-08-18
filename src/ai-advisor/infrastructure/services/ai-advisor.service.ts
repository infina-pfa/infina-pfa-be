import {
  AiAdvisorService,
  MessageEntity,
  MessageRepository,
  MessageSender,
  MessageType,
} from '@/ai-advisor/domain';
import {
  AiInternalService,
  AiStreamFlowType,
  parseStreamEvent,
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
    data: {
      sender: MessageSender;
      conversationId: string;
      message: string;
      imageUrls?: string[];
    },
    callbacks?: {
      onData?: (chunk: Buffer) => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    },
  ): Promise<void> {
    const { sender, conversationId, message, imageUrls } = data;
    const userMessage = MessageEntity.create({
      userId,
      conversationId,
      content: message,
      sender,
      type: MessageType.TEXT,
      metadata: {
        imageUrls,
      },
    });

    await this.messageRepository.create(userMessage);

    const stream = await this.aiInternalService.stream(
      userId,
      {
        message,
        conversationId,
        flowType: AiStreamFlowType.CHAT,
        images: imageUrls,
      },
      callbacks,
    );

    return stream;
  }

  handleStreamChunk(
    userId: string,
    conversationId: string,
    chunk: Buffer,
  ): void {
    const events = parseStreamEvent(chunk.toString('utf-8'));
    for (const event of events) {
      if (event.type === 'status') {
        const { status_type, message } = event.data;
        if (status_type === 'text_completed') {
          const aiMessage = MessageEntity.createAiMessage({
            userId,
            conversationId,
            content: message,
          });
          this.messageRepository.create(aiMessage);
        }
      }
      if (event.type === 'function_call' && event.data.handle_by_client) {
        const { function_args } = event.data;
        const aiMessage = MessageEntity.createAiMessage({
          userId,
          content: '',
          conversationId,
          metadata: {
            function_args,
          },
        });
        this.messageRepository.create(aiMessage);
      }
    }
  }

  async speechToText(file: Express.Multer.File): Promise<string> {
    return (await this.aiInternalService.speechToText(file)).text;
  }

  async getStartMessage(userId: string): Promise<string> {
    return this.aiInternalService.getStartMessage(userId);
  }
}
