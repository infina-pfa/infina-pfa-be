import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import {
  OnboardingProfileEntity,
  OnboardingProfileRepository,
  OnboardingErrorFactory,
} from '@/onboarding/domain';

export type GetOnboardingProfileUseCaseInput = {
  userId: string;
};

@Injectable()
export class GetOnboardingProfileUseCase extends BaseUseCase<
  GetOnboardingProfileUseCaseInput,
  OnboardingProfileEntity
> {
  constructor(
    private readonly onboardingProfileRepository: OnboardingProfileRepository,
  ) {
    super();
  }

  async execute(
    input: GetOnboardingProfileUseCaseInput,
  ): Promise<OnboardingProfileEntity> {
    const profile = await this.onboardingProfileRepository.findOne({
      userId: input.userId,
    });

    if (!profile) {
      throw OnboardingErrorFactory.profileNotFound();
    }

    return profile;
  }
}
