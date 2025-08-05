import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { CurrencyVO } from '@/common/base';
import {
  OnboardingProfileEntity,
  OnboardingProfileRepository,
} from '@/onboarding/domain';

export type UpdateOnboardingProfileUseCaseInput = {
  userId: string;
  expense?: number;
  income?: number;
  pyfAmount?: number;
  metadata?: Record<string, any>;
};

@Injectable()
export class UpdateOnboardingProfileUseCase extends BaseUseCase<
  UpdateOnboardingProfileUseCaseInput,
  OnboardingProfileEntity
> {
  constructor(
    private readonly onboardingProfileRepository: OnboardingProfileRepository,
  ) {
    super();
  }

  async execute(
    input: UpdateOnboardingProfileUseCaseInput,
  ): Promise<OnboardingProfileEntity> {
    const profile = await this.onboardingProfileRepository.findOne({
      userId: input.userId,
    });

    if (!profile) {
      throw new NotFoundException('Onboarding profile not found');
    }

    // Update financial information
    if (
      input.expense !== undefined ||
      input.income !== undefined ||
      input.pyfAmount !== undefined
    ) {
      profile.updateFinancialInfo(
        input.expense !== undefined ? new CurrencyVO(input.expense) : undefined,
        input.income !== undefined ? new CurrencyVO(input.income) : undefined,
        input.pyfAmount !== undefined
          ? new CurrencyVO(input.pyfAmount)
          : undefined,
      );
    }

    // Update metadata
    if (input.metadata !== undefined) {
      profile.updateMetadata(input.metadata);
    }

    return await this.onboardingProfileRepository.update(profile);
  }
}
