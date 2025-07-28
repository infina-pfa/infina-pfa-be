import { BaseRepository } from '@/common/index';
import { FindManyOptions } from '@/common/types/query.types';
import { TransactionEntity } from '../entities/transactions.entity';

export abstract class TransactionRepository extends BaseRepository<TransactionEntity> {
  abstract findManyByMonth(
    props: Partial<TransactionEntity['props']>,
    options?: FindManyOptions & {
      month: number;
      year: number;
    },
  ): Promise<TransactionEntity[]>;
}
