import { BaseRepository } from '@/common/base';
import { GoalEntity } from '../entities/goal.entity';

export abstract class GoalRepository extends BaseRepository<GoalEntity> {}
