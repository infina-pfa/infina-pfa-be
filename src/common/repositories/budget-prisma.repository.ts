import { BudgetCategory, BudgetEntity } from '@/budgeting/domain';
import { PrismaClient } from '@/common/prisma/prisma-client';
import { PrismaRepository } from '@/common/repositories/prisma.repository';
import { PrismaDelegate } from '@/common/types/prisma';
import { Injectable } from '@nestjs/common';
import { Decimal } from 'generated/prisma/runtime/library';
import { budgets as BudgetORM } from '../../../generated/prisma';
import { BaseRepository } from './base.repository';

@Injectable()
export class BudgetPrismaRepository
  extends PrismaRepository<BudgetEntity>
  implements BaseRepository<BudgetEntity>
{
  constructor(prismaClient: PrismaClient) {
    super(prismaClient.budgets as PrismaDelegate<BudgetORM>);
  }

  public toORM(entity: BudgetEntity): BudgetORM {
    const props = entity.props;
    return {
      id: entity.id,
      name: props.name,
      month: props.month,
      year: props.year,
      user_id: props.userId,
      amount: new Decimal(props.amount),
      category: props.category,
      color: props.color,
      icon: props.icon,
      created_at: props.createdAt,
      updated_at: props.updatedAt,
    };
  }

  public toEntity(data: BudgetORM): BudgetEntity {
    return BudgetEntity.create(
      {
        name: data.name,
        month: data.month,
        year: data.year,
        userId: data.user_id,
        amount: data.amount.toNumber() || 0,
        category: data.category as BudgetCategory,
        color: data.color,
        icon: data.icon,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      },
      data.id,
    );
  }
}
