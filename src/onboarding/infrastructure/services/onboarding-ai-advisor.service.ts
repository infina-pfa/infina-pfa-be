import {
  AiInternalService,
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
    const userMessage = OnboardingMessageEntity.create({
      userId,
      sender: OnboardingMessageSender.USER,
      content: message,
    });

    await this.onboardingMessageRepository.create(userMessage);

    const stream = await this.aiInternalService.stream(
      userId,
      message,
      `onboarding-${userId}`,
      AiStreamFlowType.ONBOARDING,
      callbacks,
    );

    return stream;
  }
}
