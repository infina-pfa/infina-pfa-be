import { Global, Module } from '@nestjs/common';
import { supabaseClient } from '../repositories/supabase-client';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,
      useValue: supabaseClient,
    },
  ],
  exports: [SUPABASE_CLIENT],
})
export class SupabaseModule {}
