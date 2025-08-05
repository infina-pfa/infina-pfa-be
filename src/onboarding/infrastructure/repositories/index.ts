import {
  OnboardingProfileRepository,
  OnboardingMessageRepository,
} from '@/onboarding/domain';
import { Provider } from '@nestjs/common';
import { OnboardingProfileRepositoryImpl } from './onboarding-profile.repository';
import { OnboardingMessageRepositoryImpl } from './onboarding-message.repository';

export const repositories: Provider[] = [
  {
    provide: OnboardingProfileRepository,
    useClass: OnboardingProfileRepositoryImpl,
  },
  {
    provide: OnboardingMessageRepository,
    useClass: OnboardingMessageRepositoryImpl,
  },
];

export * from './onboarding-profile.repository';
export * from './onboarding-message.repository';
