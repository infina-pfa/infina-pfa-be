import { BaseRepository } from '@/common/base';
import { TransactionEntity } from '@/budgeting/domain/entities/transactions.entity';

export abstract class TransactionRepository extends BaseRepository<TransactionEntity> {}
