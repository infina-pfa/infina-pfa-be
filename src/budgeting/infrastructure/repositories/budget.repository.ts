import { SUPABASE_CLIENT } from '@/common/module/supabase.module';
import { BudgetSupabaseRepository } from '@/common/repositories/budget-supabase.repository';
import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class BudgetRepositoryImpl extends BudgetSupabaseRepository {
  constructor(
    @Inject(SUPABASE_CLIENT)
    protected readonly supabase: SupabaseClient,
  ) {
    super(supabase);
  }
}
