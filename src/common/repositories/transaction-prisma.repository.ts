import { TransactionEntity, TransactionType } from '@/budgeting/domain';
import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import {
  transaction_type,
  transactions as TransactionORM,
} from '../../../generated/prisma';
import { PrismaDelegate } from '../types/prisma';
import { PrismaRepository } from './prisma.repository';
import { BaseRepository } from './base.repository';

@Injectable()
export class TransactionPrismaRepository
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
      amount: new Decimal(props.amount),
      recurring: props.recurring,
      description: props.description,
      type: props.type as unknown as transaction_type,
      created_at: props.createdAt,
      updated_at: props.updatedAt,
    };
  }

  public toEntity(data: TransactionORM): TransactionEntity {
    return TransactionEntity.create(
      {
        name: data.name,
        userId: data.user_id as string,
        amount: data.amount.toNumber(),
        recurring: data.recurring,
        description: data.description as string,
        type: data.type as unknown as TransactionType,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      data.id,
    );
  }
}
