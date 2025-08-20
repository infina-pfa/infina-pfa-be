import { PrismaRepository } from '@/common/prisma/repositories/prisma.repository';
import { BaseRepository, CurrencyVO } from '@/common/base';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../prisma-client';
import { Decimal, PrismaDelegate } from '@/common/types/prisma';
import { DebtORM } from '@/common/types/orms';
import { DebtEntity } from '@/debt/domain';

@Injectable()
export class DebtPrismaRepository
  extends PrismaRepository<DebtEntity>
  implements BaseRepository<DebtEntity>
{
  constructor(prismaClient: PrismaClient) {
    super(prismaClient.debts as PrismaDelegate<DebtORM>);
  }

  public toORM(entity: DebtEntity): DebtORM {
    const { createdAt, updatedAt, deletedAt, ...props } = entity.props;
    return {
      id: entity.id,
      created_at: createdAt,
      updated_at: updatedAt,
      user_id: props.userId,
      lender: props.lender,
      purpose: props.purpose,
      amount: new Decimal(props.amount.value),
      rate: new Decimal(props.rate),
      due_date: props.dueDate,
      deleted_at: deletedAt ?? null,
    };
  }

  public toEntity(data: DebtORM): DebtEntity {
    return DebtEntity.create(
      {
        userId: data.user_id,
        lender: data.lender,
        purpose: data.purpose,
        amount: new CurrencyVO(data.amount.toNumber()),
        rate: data.rate.toNumber(),
        dueDate: data.due_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      data.id,
    );
  }
}
