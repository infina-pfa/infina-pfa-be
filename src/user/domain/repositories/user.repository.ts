import { BaseRepository } from '@/common/base';
import { UserEntity } from '../entities/user.entity';

export abstract class UserRepository extends BaseRepository<UserEntity> {}
