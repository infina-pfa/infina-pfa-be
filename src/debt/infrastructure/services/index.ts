import { DebtManagerService } from '@/debt/domain';
import { Provider } from '@nestjs/common';
import { DebtManagerServiceImpl } from './debt-manager.service';

export * from './debt-manager.service';

export const services: Provider[] = [
  {
    provide: DebtManagerService,
    useClass: DebtManagerServiceImpl,
  },
];
