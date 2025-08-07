import { InternalAiModule } from '@/common/internal-services';
import {
  OnboardingMessageInternalController,
  OnboardingProfileInternalController,
} from '@/onboarding/controllers';
import { services } from '@/onboarding/infrastructure/services';
import { repositories } from '@/onboarding/infrastructure/repositories';
import { onboardingUseCases } from '@/onboarding/use-cases';
import { Module } from '@nestjs/common';

@Module({
  imports: [InternalAiModule],
  controllers: [
    OnboardingProfileInternalController,
    OnboardingMessageInternalController,
  ],
  providers: [...repositories, ...onboardingUseCases, ...services],
  exports: [...repositories, ...onboardingUseCases],
})
export class OnboardingInternalModule {}
