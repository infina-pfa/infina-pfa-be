import { GoalEntity } from '../../../goals/domain/entities/goal.entity';
import { PrismaRepository } from './prisma.repository';
import { PrismaClient } from '../prisma-client';
import { GoalORM } from '@/common/types/orms';
import { Decimal, PrismaDelegate } from '@/common/types/prisma';
import { Injectable } from '@nestjs/common';
import { CurrencyVO } from '../../base/value-objects';
import { BaseRepository } from '../../base/repositories/base.repository';

@Injectable()
export class GoalPrismaRepository
  extends PrismaRepository<GoalEntity>
  implements BaseRepository<GoalEntity>
{
  constructor(prismaClient: PrismaClient) {
    super(prismaClient.goals as PrismaDelegate<GoalORM>);
  }

  public toORM(entity: GoalEntity): GoalORM {
    const props = entity.props;
    return {
      id: entity.id,
      title: props.title,
      description: props.description || null,
      user_id: props.userId,
      current_amount: new Decimal(props.currentAmount.value),
      target_amount: props.targetAmount
        ? new Decimal(props.targetAmount.value)
        : null,
      due_date: props.dueDate || null,
      created_at: props.createdAt,
      updated_at: props.updatedAt,
      deleted_at: props.deletedAt || null,
    };
  }

  public toEntity(data: GoalORM): GoalEntity {
    return GoalEntity.create(
      {
        title: data.title,
        description: data.description || undefined,
        userId: data.user_id,
        currentAmount: new CurrencyVO(data.current_amount.toNumber()),
        targetAmount: data.target_amount
          ? new CurrencyVO(data.target_amount.toNumber())
          : undefined,
        dueDate: data.due_date || undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
      },
      data.id,
    );
  }
}
