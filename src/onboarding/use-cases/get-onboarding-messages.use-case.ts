import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import {
  OnboardingMessageEntity,
  OnboardingMessageRepository,
} from '@/onboarding/domain';
import { Injectable } from '@nestjs/common';

export type GetOnboardingMessagesUseCaseInput = {
  userId: string;
};

@Injectable()
export class GetOnboardingMessagesUseCase extends BaseUseCase<
  GetOnboardingMessagesUseCaseInput,
  OnboardingMessageEntity[]
> {
  constructor(
    private readonly onboardingMessageRepository: OnboardingMessageRepository,
  ) {
    super();
  }

  async execute(
    input: GetOnboardingMessagesUseCaseInput,
  ): Promise<OnboardingMessageEntity[]> {
    return await this.onboardingMessageRepository.findMany({
      userId: input.userId,
    });
  }
}
