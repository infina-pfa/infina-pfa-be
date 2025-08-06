import { UserEventHandler } from '@/onboarding/domain';
import { UserEventHandlerImpl } from './user.event-handler';
import { Provider } from '@nestjs/common';

export const eventHandlers: Provider[] = [
  {
    provide: UserEventHandler,
    useClass: UserEventHandlerImpl,
  },
];
