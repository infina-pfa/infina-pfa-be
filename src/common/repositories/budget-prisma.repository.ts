import {
  BudgetCategory,
  BudgetEntity,
  BudgetEntityProps,
} from '@/budgeting/domain';
import { PrismaClient } from '@/common/prisma/prisma-client';
import { PrismaRepository } from '@/common/repositories/prisma.repository';
import { PrismaDelegate } from '@/common/types/prisma';
import { Injectable } from '@nestjs/common';
import { Decimal } from '../../../generated/prisma/runtime/library';
import { budgets as BudgetORM } from '../../../generated/prisma';
import { BaseRepository } from './base.repository';
import { FindManyOptions } from '../types/query.types';
import { CurrencyVO } from '@/common/value-objects';

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
      amount: new Decimal(props.amount.value),
      category: props.category,
      color: props.color,
      icon: props.icon,
      created_at: props.createdAt,
      updated_at: props.updatedAt,
      archived_at: props.archivedAt || null,
    };
  }

  public toEntity(data: BudgetORM): BudgetEntity {
    return BudgetEntity.create(
      {
        name: data.name,
        month: data.month,
        year: data.year,
        userId: data.user_id,
        amount: new CurrencyVO(data.amount.toNumber()),
        category: data.category as BudgetCategory,
        color: data.color,
        icon: data.icon,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        archivedAt: data.archived_at || null,
      },
      data.id,
    );
  }

  public override async findOne(
    props: Partial<Readonly<BudgetEntityProps>>,
  ): Promise<BudgetEntity | null> {
    return super.findOne({ ...props, archivedAt: null });
  }

  public override async findMany(
    props: Partial<Readonly<BudgetEntityProps>>,
    options?: FindManyOptions,
  ): Promise<BudgetEntity[]> {
    return super.findMany({ ...props, archivedAt: null }, options);
  }
}
