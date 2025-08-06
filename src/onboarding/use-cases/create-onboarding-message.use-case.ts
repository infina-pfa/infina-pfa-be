import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import {
  OnboardingMessageEntity,
  OnboardingMessageRepository,
  MessageSender,
  OnboardingErrorFactory,
} from '@/onboarding/domain';

export type CreateOnboardingMessageUseCaseInput = {
  userId: string;
  sender: MessageSender;
  content: string;
  componentId?: string;
  metadata?: Record<string, any>;
};

@Injectable()
export class CreateOnboardingMessageUseCase extends BaseUseCase<
  CreateOnboardingMessageUseCaseInput,
  OnboardingMessageEntity
> {
  constructor(
    private readonly onboardingMessageRepository: OnboardingMessageRepository,
  ) {
    super();
  }

  async execute(
    input: CreateOnboardingMessageUseCaseInput,
  ): Promise<OnboardingMessageEntity> {
    // Validate content
    if (!input.content || input.content.trim().length === 0) {
      throw OnboardingErrorFactory.messageInvalidContent();
    }

    // Validate sender
    if (!Object.values(MessageSender).includes(input.sender)) {
      throw OnboardingErrorFactory.messageInvalidSender();
    }

    const message = OnboardingMessageEntity.create({
      userId: input.userId,
      sender: input.sender,
      content: input.content.trim(),
      componentId: input.componentId || null,
      metadata: input.metadata || null,
    });

    return await this.onboardingMessageRepository.create(message);
  }
}
