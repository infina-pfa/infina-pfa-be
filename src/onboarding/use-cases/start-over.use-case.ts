import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { OnboardingErrorFactory, OnboardingProfileRepository } from '../domain';

export type StartOverUseCaseInput = {
  userId: string;
};

@Injectable()
export class StartOverUseCase extends BaseUseCase<StartOverUseCaseInput, void> {
  constructor(
    private readonly onboardingProfileRepository: OnboardingProfileRepository,
  ) {
    super();
  }

  async execute(input: StartOverUseCaseInput): Promise<void> {
    const profile = await this.onboardingProfileRepository.findOne({
      userId: input.userId,
    });
    if (!profile) {
      throw OnboardingErrorFactory.profileNotFound();
    }

    profile.resetProfile();
    await this.onboardingProfileRepository.update(profile);
  }
}
