import { OnboardingAiAdvisorService } from '@/onboarding/domain';
import { Provider } from '@nestjs/common';
import { OnboardingAiAdvisorServiceImpl } from './onboarding-ai-advisor.service';

export const services: Provider[] = [
  {
    provide: OnboardingAiAdvisorService,
    useClass: OnboardingAiAdvisorServiceImpl,
  },
];
