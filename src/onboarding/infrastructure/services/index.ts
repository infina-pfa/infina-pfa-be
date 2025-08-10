import {
  BudgetManagerService,
  OnboardingAiAdvisorService,
  UserFinancialInfoService,
} from '@/onboarding/domain';
import { Provider } from '@nestjs/common';
import { OnboardingAiAdvisorServiceImpl } from './onboarding-ai-advisor.service';
import { UserFinancialInfoServiceImpl } from './user-financial-info.service';
import { BudgetManagerServiceImpl } from './budget-manager.service';

export const services: Provider[] = [
  {
    provide: OnboardingAiAdvisorService,
    useClass: OnboardingAiAdvisorServiceImpl,
  },
  {
    provide: UserFinancialInfoService,
    useClass: UserFinancialInfoServiceImpl,
  },
  {
    provide: BudgetManagerService,
    useClass: BudgetManagerServiceImpl,
  },
];
