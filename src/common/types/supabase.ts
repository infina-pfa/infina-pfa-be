import { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import { Database } from './database';

export type SupabaseClient = SupabaseClientType<Database>;
