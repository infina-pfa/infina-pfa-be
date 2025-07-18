import { BudgetCategory, BudgetEntity } from '@/budgeting';
import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../module/supabase.module';
import { Database } from '../types/database';
import { SupabaseRepository, TableNames } from './supabase.repository';

export type BudgetORM = Database['public']['Tables']['budgets']['Row'];

@Injectable()
export class BudgetSupabaseRepository extends SupabaseRepository<BudgetEntity> {
  public get tableName(): TableNames {
    return 'budgets';
  }

  public toORM(entity: BudgetEntity): BudgetORM {
    const props = entity.props;

    return {
      id: entity.id,
      amount: props.amount,
      category: props.category,
      color: props.color,
      icon: props.icon,
      month: props.month,
      name: props.name,
      user_id: props.userId,
      year: props.year,
      created_at: props.createdAt.toISOString(),
      updated_at: props.updatedAt.toISOString(),
    };
  }

  public toEntity(data: BudgetORM): BudgetEntity {
    return BudgetEntity.create(
      {
        amount: data.amount,
        category: data.category as BudgetCategory,
        color: data.color,
        icon: data.icon,
        month: data.month,
        name: data.name,
        userId: data.user_id,
        year: data.year,
      },
      data.id,
    );
  }

  constructor(
    @Inject(SUPABASE_CLIENT)
    protected readonly supabase: SupabaseClient<Database>,
  ) {
    super(supabase);
  }
}
