import {
  BudgetCategory,
  BudgetEntity,
  BudgetEntityProps,
} from '@/budgeting/domain';
import { PrismaRepository } from './prisma.repository';
import { PrismaClient } from '../prisma-client';
import { BudgetORM } from '@/common/types/orms';
import { Decimal, PrismaDelegate } from '@/common/types/prisma';
import { Injectable } from '@nestjs/common';
import { FindManyOptions } from '../../types/query.types';
import { CurrencyVO } from '../../base/value-objects';
import { BaseRepository } from '../../base/repositories/base.repository';

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
      deleted_at: props.deletedAt || null,
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
        deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
      },
      data.id,
    );
  }

  public override async findOne(
    props: Partial<Readonly<BudgetEntityProps>>,
  ): Promise<BudgetEntity | null> {
    return super.findOne({ ...props });
  }

  public override async findMany(
    props: Partial<Readonly<BudgetEntityProps>>,
    options?: FindManyOptions,
  ): Promise<BudgetEntity[]> {
    return super.findMany({ ...props }, options);
  }
}
