import { Provider } from '@nestjs/common';
import { UserServiceImpl } from './user.service';
import { UserService } from '@/user/domain';

export const userServices: Provider[] = [
  {
    provide: UserService,
    useClass: UserServiceImpl,
  },
];
