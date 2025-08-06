import { Module } from '@nestjs/common';
import { repositories } from '@/onboarding/infrastructure/repositories';
import { onboardingUseCases } from '@/onboarding/use-cases';
import {
  OnboardingProfileController,
  OnboardingMessageController,
} from '@/onboarding/controllers';
import { eventHandlers } from '../infrastructure/event-handlers';

@Module({
  controllers: [OnboardingProfileController, OnboardingMessageController],
  providers: [...repositories, ...onboardingUseCases, ...eventHandlers],
  exports: [...repositories, ...onboardingUseCases],
})
export class OnboardingModule {}
