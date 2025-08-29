import { OnboardingProfileORM } from '@/common/types/orms';
import { Decimal, PrismaDelegate } from '@/common/types/prisma';
import {
  BudgetingStyle,
  Metadata,
  OnboardingProfileEntity,
  PyfMetadata,
} from '@/onboarding/domain';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../base/repositories/base.repository';
import { CurrencyVO } from '../../base/value-objects';
import { PrismaClient } from '../prisma-client';
import { PrismaRepository } from './prisma.repository';
import { JsonValue } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OnboardingProfilePrismaRepository
  extends PrismaRepository<OnboardingProfileEntity>
  implements BaseRepository<OnboardingProfileEntity>
{
  constructor(prismaClient: PrismaClient) {
    super(
      prismaClient.onboarding_profiles as PrismaDelegate<OnboardingProfileORM>,
    );
  }

  public toORM(entity: OnboardingProfileEntity): OnboardingProfileORM {
    const props = entity.props;
    return {
      id: entity.id,
      user_id: props.userId,
      metadata: props.metadata as unknown as JsonValue,
      completed_at: props.completedAt,
      expense: props.expense ? new Decimal(props.expense.value) : null,
      income: props.income ? new Decimal(props.income.value) : null,
      pyf_amount: props.pyfAmount ? new Decimal(props.pyfAmount.value) : null,
      budgeting_style: props.budgetingStyle,
      created_at: props.createdAt,
      updated_at: props.updatedAt,
      deleted_at: props.deletedAt,
      pyf_metadata: props.pyfMetadata,
      session_id: props.sessionId,
    };
  }

  public toEntity(data: OnboardingProfileORM): OnboardingProfileEntity {
    return OnboardingProfileEntity.create(
      {
        userId: data.user_id,
        metadata: data.metadata as Metadata | null,
        completedAt: data.completed_at ? new Date(data.completed_at) : null,
        expense: data.expense ? new CurrencyVO(data.expense.toNumber()) : null,
        income: data.income ? new CurrencyVO(data.income.toNumber()) : null,
        pyfAmount: data.pyf_amount
          ? new CurrencyVO(data.pyf_amount.toNumber())
          : null,
        pyfMetadata: data.pyf_metadata as PyfMetadata | null,
        budgetingStyle: data.budgeting_style as BudgetingStyle | null,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
        sessionId: data.session_id ?? uuidv4(),
      },
      data.id,
    );
  }
}
