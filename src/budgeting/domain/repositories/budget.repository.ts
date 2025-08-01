import { BaseRepository } from '@/common/base';
import { BudgetEntity } from '../entities/budget.entity';

export abstract class BudgetRepository extends BaseRepository<BudgetEntity> {}
