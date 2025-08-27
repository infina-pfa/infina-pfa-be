import { Provider } from '@nestjs/common';
import { CompleteOnboardingUseCase } from './complete-onboarding.use-case';
import { CreateOnboardingMessageUseCase } from './create-onboarding-message.use-case';
import { CreateOnboardingProfileUseCase } from './create-onboarding-profile.use-case';
import { GetOnboardingMessagesUseCase } from './get-onboarding-messages.use-case';
import { GetOnboardingProfileUseCase } from './get-onboarding-profile.use-case';
import { UpdateOnboardingProfileUseCase } from './update-onboarding-profile.use-case';
import { MonthlyResetPyfMetadataUseCase } from './monthly-reset-pyf-metadata.use-case';

export const onboardingUseCases: Provider[] = [
  CreateOnboardingProfileUseCase,
  UpdateOnboardingProfileUseCase,
  GetOnboardingProfileUseCase,
  CreateOnboardingMessageUseCase,
  GetOnboardingMessagesUseCase,
  CompleteOnboardingUseCase,
  MonthlyResetPyfMetadataUseCase,
];

export {
  CompleteOnboardingUseCase,
  CreateOnboardingMessageUseCase,
  CreateOnboardingProfileUseCase,
  GetOnboardingMessagesUseCase,
  GetOnboardingProfileUseCase,
  UpdateOnboardingProfileUseCase,
  MonthlyResetPyfMetadataUseCase,
};
