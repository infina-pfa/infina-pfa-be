import { OnboardingProfileInternalController } from '@/onboarding/controllers';
import { repositories } from '@/onboarding/infrastructure/repositories';
import { onboardingUseCases } from '@/onboarding/use-cases';
import { Module } from '@nestjs/common';

@Module({
  controllers: [OnboardingProfileInternalController],
  providers: [...repositories, ...onboardingUseCases],
  exports: [...repositories, ...onboardingUseCases],
})
export class OnboardingInternalModule {}
