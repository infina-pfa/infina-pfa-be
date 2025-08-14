import {
  AiAdvisorService,
  UserFinancialManagerService,
} from '@/ai-advisor/domain';
import { Provider } from '@nestjs/common';
import { AiAdvisorServiceImpl } from './ai-advisor.service';
import { UserFinancialManagerServiceImpl } from './user-financial-manager.service';

export const services: Provider[] = [
  {
    provide: AiAdvisorService,
    useClass: AiAdvisorServiceImpl,
  },
  {
    provide: UserFinancialManagerService,
    useClass: UserFinancialManagerServiceImpl,
  },
];
