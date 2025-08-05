import { TransactionEntity, TransactionType } from '@/budgeting/domain';
import { Decimal, PrismaDelegate } from '@/common/types/prisma';
import { Injectable } from '@nestjs/common';
import {
  transaction_type,
  transactions as TransactionORM,
} from '../../../../generated/prisma';
import { CurrencyVO } from '../../base/value-objects';
import { BaseRepository } from '../../base/repositories/base.repository';
import { PrismaRepository } from './prisma.repository';

@Injectable()
export abstract class TransactionPrismaRepository
  extends PrismaRepository<TransactionEntity>
  implements BaseRepository<TransactionEntity>
{
  constructor(
    protected readonly prismaDelegate: PrismaDelegate<TransactionORM>,
  ) {
    super(prismaDelegate);
  }

  public toORM(entity: TransactionEntity): TransactionORM {
    const props = entity.props;
    return {
      id: entity.id,
      name: props.name,
      user_id: props.userId,
      amount: new Decimal(props.amount.value),
      recurring: props.recurring,
      description: props.description,
      type: props.type as unknown as transaction_type,
      created_at: props.createdAt,
      updated_at: props.updatedAt,
      deleted_at: props.deletedAt || null,
    };
  }

  public toEntity(data: TransactionORM): TransactionEntity {
    return TransactionEntity.create(
      {
        name: data.name,
        userId: data.user_id as string,
        amount: new CurrencyVO(data.amount.toNumber()),
        recurring: data.recurring,
        description: data.description as string,
        type: data.type as unknown as TransactionType,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
      },
      data.id,
    );
  }
}
