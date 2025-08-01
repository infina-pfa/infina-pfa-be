import { BaseRepository } from '@/common/base';
import { TransactionEntity } from '../entities/transactions.entity';

export abstract class TransactionRepository extends BaseRepository<TransactionEntity> {}
