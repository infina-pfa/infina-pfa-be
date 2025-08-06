import { Provider } from '@nestjs/common';
import { AiAdvisorService } from '@/ai-advisor/domain';
import { AiAdvisorServiceImpl } from './ai-advisor.service';

export const services: Provider[] = [
  {
    provide: AiAdvisorService,
    useClass: AiAdvisorServiceImpl,
  },
];
