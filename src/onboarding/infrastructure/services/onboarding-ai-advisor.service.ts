import {
  AiInternalService,
  AiStreamConversationMessageRole,
  AiStreamFlowType,
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
    const messages = await this.onboardingMessageRepository.findMany(
      {
        userId,
      },
      {
        sort: [{ field: 'created_at', direction: 'asc' }],
      },
    );

    const userMessage = OnboardingMessageEntity.create({
      userId,
      sender: OnboardingMessageSender.USER,
      content: message,
    });

    await this.onboardingMessageRepository.create(userMessage);

    const stream = await this.aiInternalService.stream(
      userId,
      message,
      messages
        .filter((message) => !message.componentId)
        .map((message) => ({
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
}
