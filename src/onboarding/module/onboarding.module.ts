import { Module } from '@nestjs/common';
import { repositories } from '@/onboarding/infrastructure/repositories';
import { onboardingUseCases } from '@/onboarding/use-cases';
import {
  OnboardingProfileController,
  OnboardingMessageController,
} from '@/onboarding/controllers';
import { eventHandlers } from '../infrastructure/event-handlers';
import { services } from '../infrastructure/services';
import { InternalAiModule } from '@/common/internal-services';

@Module({
  imports: [InternalAiModule],
  controllers: [OnboardingProfileController, OnboardingMessageController],
  providers: [
    ...repositories,
    ...onboardingUseCases,
    ...eventHandlers,
    ...services,
  ],
  exports: [...repositories, ...onboardingUseCases],
})
export class OnboardingModule {}
