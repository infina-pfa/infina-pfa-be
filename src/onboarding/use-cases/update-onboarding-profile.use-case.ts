import { Injectable } from '@nestjs/common';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { CurrencyVO } from '@/common/base';
import {
  OnboardingProfileEntity,
  OnboardingProfileRepository,
  OnboardingErrorFactory,
  BudgetingStyle,
  Metadata,
  PyfMetadata,
} from '@/onboarding/domain';

export type UpdateOnboardingProfileUseCaseInput = {
  userId: string;
  expense?: number;
  income?: number;
  pyfAmount?: number;
  metadata?: Metadata;
  budgetingStyle?: BudgetingStyle;
  pyfMetadata?: PyfMetadata;
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
    console.log(
      '🚀 ~ UpdateOnboardingProfileUseCase ~ execute ~ input:',
      input,
    );
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

    const profile = await this.onboardingProfileRepository.findOne({
      userId: input.userId,
    });

    if (!profile) {
      throw OnboardingErrorFactory.profileNotFound();
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

    if (input.budgetingStyle !== undefined) {
      profile.updateBudgetingStyle(input.budgetingStyle);
    }

    // Update metadata
    if (input.metadata !== undefined) {
      profile.updateMetadata(input.metadata);
    }

    if (input.pyfMetadata !== undefined) {
      profile.updatePyfMetadata(input.pyfMetadata);
    }

    return await this.onboardingProfileRepository.update(profile);
  }
}
