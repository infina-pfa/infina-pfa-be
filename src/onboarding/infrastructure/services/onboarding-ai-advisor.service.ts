import {
  AiInternalService,
  AiStreamConversationMessageRole,
  AiStreamFlowType,
  parseStreamEvent,
} from '@/common/internal-services';
import {
  OnboardingAiAdvisorService,
  OnboardingMessageEntity,
  OnboardingMessageRepository,
  OnboardingMessageSender,
} from '@/onboarding/domain';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OnboardingAiAdvisorServiceImpl
  implements OnboardingAiAdvisorService
{
  constructor(
    private readonly onboardingMessageRepository: OnboardingMessageRepository,
    private readonly aiInternalService: AiInternalService,
  ) {}

  async stream(
    userId: string,
    message: string,
    callbacks?: {
      onData?: (chunk: Buffer) => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    },
  ): Promise<void> {
    const messages = await this.onboardingMessageRepository.findMany({
      userId,
    });

    const userMessage = OnboardingMessageEntity.create({
      userId,
      sender: OnboardingMessageSender.USER,
      content: message,
    });

    await this.onboardingMessageRepository.create(userMessage);

    const stream = await this.aiInternalService.stream(
      userId,
      message,
      messages.map((message) => ({
        role:
          message.sender === OnboardingMessageSender.AI
            ? AiStreamConversationMessageRole.ASSISTANT
            : AiStreamConversationMessageRole.USER,
        content: message.content,
      })),
      AiStreamFlowType.ONBOARDING,
      callbacks,
    );

    return stream;
  }

  handleStreamChunk(userId: string, chunk: Buffer): void {
    const events = parseStreamEvent(chunk.toString('utf-8'));
    for (const event of events) {
      if (event.type === 'status') {
        const { status_type, message } = event.data;
        if (status_type === 'text_completed') {
          const aiMessage = OnboardingMessageEntity.create({
            userId,
            sender: OnboardingMessageSender.AI,
            content: message,
          });
          this.onboardingMessageRepository.create(aiMessage);
        }
      }
      if (event.type === 'function_call' && event.data.handle_by_client) {
        const { function_name, function_args } = event.data;
        const aiMessage = OnboardingMessageEntity.create({
          userId,
          sender: OnboardingMessageSender.AI,
          content: '',
          componentId: function_name,
          metadata: function_args,
        });
        this.onboardingMessageRepository.create(aiMessage);
      }
    }
  }
}
