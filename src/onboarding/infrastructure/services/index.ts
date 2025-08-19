import {
  BudgetManagerService,
  OnboardingAiAdvisorService,
  UserFinancialInfoService,
} from '@/onboarding/domain';
import { GoalManagerService } from '@/onboarding/domain/services';
import { Provider } from '@nestjs/common';
import { BudgetManagerServiceImpl } from './budget-manager.service';
import { GoalManagerServiceImpl } from './goal-manager.service';
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
  {
    provide: BudgetManagerService,
    useClass: BudgetManagerServiceImpl,
  },
  {
    provide: GoalManagerService,
    useClass: GoalManagerServiceImpl,
  },
];
