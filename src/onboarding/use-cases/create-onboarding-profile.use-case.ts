import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { CurrencyVO } from '@/common/base';
import {
  OnboardingProfileEntity,
  OnboardingProfileRepository,
  OnboardingErrorFactory,
} from '@/onboarding/domain';

export type CreateOnboardingProfileUseCaseInput = {
  userId: string;
  expense?: number;
  income?: number;
  pyfAmount?: number;
  metadata?: Record<string, any>;
};

@Injectable()
export class CreateOnboardingProfileUseCase extends BaseUseCase<
  CreateOnboardingProfileUseCaseInput,
  OnboardingProfileEntity
> {
  constructor(
    private readonly onboardingProfileRepository: OnboardingProfileRepository,
  ) {
    super();
  }

  async execute(
    input: CreateOnboardingProfileUseCaseInput,
  ): Promise<OnboardingProfileEntity> {
    // Validate input amounts
    if (input.expense !== undefined && input.expense < 0) {
      throw OnboardingErrorFactory.profileInvalidAmount();
    }
    if (input.income !== undefined && input.income < 0) {
      throw OnboardingErrorFactory.profileInvalidAmount();
    }
    if (input.pyfAmount !== undefined && input.pyfAmount < 0) {
      throw OnboardingErrorFactory.profileInvalidAmount();
    }

    // Check if user already has an onboarding profile
    const existingProfile = await this.onboardingProfileRepository.findOne({
      userId: input.userId,
    });

    if (existingProfile) {
      throw OnboardingErrorFactory.profileAlreadyExists();
    }

    const profile = OnboardingProfileEntity.create({
      userId: input.userId,
      expense: input.expense ? new CurrencyVO(input.expense) : null,
      income: input.income ? new CurrencyVO(input.income) : null,
      pyfAmount: input.pyfAmount ? new CurrencyVO(input.pyfAmount) : null,
      metadata: input.metadata || null,
    });

    return await this.onboardingProfileRepository.create(profile);
  }
}
