import {
  OnboardingAiAdvisorService,
  UserFinancialInfoService,
} from '@/onboarding/domain';
import { Provider } from '@nestjs/common';
import { OnboardingAiAdvisorServiceImpl } from './onboarding-ai-advisor.service';
import { UserFinancialInfoServiceImpl } from './user-financial-info.service';

export const services: Provider[] = [
  {
    provide: OnboardingAiAdvisorService,
    useClass: OnboardingAiAdvisorServiceImpl,
  },
  {
    provide: UserFinancialInfoService,
    useClass: UserFinancialInfoServiceImpl,
  },
];
