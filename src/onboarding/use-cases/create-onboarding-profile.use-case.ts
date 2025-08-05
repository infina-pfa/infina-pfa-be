import { Injectable, ConflictException } from '@nestjs/common';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { CurrencyVO } from '@/common/base';
import {
  OnboardingProfileEntity,
  OnboardingProfileRepository,
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
    // Check if user already has an onboarding profile
    const existingProfile = await this.onboardingProfileRepository.findOne({
      userId: input.userId,
    });

    if (existingProfile) {
      throw new ConflictException('User already has an onboarding profile');
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
