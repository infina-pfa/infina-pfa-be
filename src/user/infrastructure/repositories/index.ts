import { Provider } from '@nestjs/common';
import { UserRepositoryImpl } from './user.repository';
import { UserRepository } from '@/user/domain';

export const repositories: Provider[] = [
  {
    provide: UserRepository,
    useClass: UserRepositoryImpl,
  },
];
