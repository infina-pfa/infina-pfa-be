import {
  BudgetManagerService,
  OnboardingAiAdvisorService,
  UserFinancialInfoService,
} from '@/onboarding/domain';
import {
  DebtManagerService,
  GoalManagerService,
} from '@/onboarding/domain/services';
import { Provider } from '@nestjs/common';
import { BudgetManagerServiceImpl } from './budget-manager.service';
import { GoalManagerServiceImpl } from './goal-manager.service';
import { OnboardingAiAdvisorServiceImpl } from './onboarding-ai-advisor.service';
import { UserFinancialInfoServiceImpl } from './user-financial-info.service';
import { DebtManagerServiceImpl } from './debt-manager.service';

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
  {
    provide: DebtManagerService,
    useClass: DebtManagerServiceImpl,
  },
];
