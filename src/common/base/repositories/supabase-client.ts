import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/common/types/database';

export const supabaseClient: SupabaseClient<Database> = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);
