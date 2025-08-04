-- Migration: Add comprehensive indexes for performance optimization
-- Tables in public schema: budget_transactions, budgets, conversations, goal_transactions, 
-- goals, messages, onboarding_profiles, transactions, public_users, onboarding_messages

-- budgets table indexes
-- Add composite index for budget name lookups (addresses your main performance issue)
CREATE INDEX IF NOT EXISTS idx_budgets_user_name_year_month ON public.budgets USING btree (user_id, name, year, month);
-- Add index for archived budgets queries
CREATE INDEX IF NOT EXISTS idx_budgets_archived_at ON public.budgets USING btree (archived_at) WHERE archived_at IS NOT NULL;
-- Add index for category-based queries
CREATE INDEX IF NOT EXISTS idx_budgets_category ON public.budgets USING btree (category);

-- transactions table indexes
-- Add index for transaction name lookups
CREATE INDEX IF NOT EXISTS idx_transactions_name ON public.transactions USING btree (name);
-- Add index for amount-based queries (useful for reporting)
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON public.transactions USING btree (amount);
-- Add index for recurring transactions
CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON public.transactions USING btree (recurring) WHERE recurring > 0;

-- budget_transactions table indexes
-- Add composite index for user+budget lookups
CREATE INDEX IF NOT EXISTS idx_budget_transactions_user_budget ON public.budget_transactions USING btree (user_id, budget_id);
-- Add index for created_at to optimize time-based queries
CREATE INDEX IF NOT EXISTS idx_budget_transactions_created_at ON public.budget_transactions USING btree (created_at DESC);

-- goal_transactions table indexes
-- Add composite index for user+goal lookups
CREATE INDEX IF NOT EXISTS idx_goal_transactions_user_goal ON public.goal_transactions USING btree (user_id, goal_id);

-- goals table indexes
-- Add index for title lookups
CREATE INDEX IF NOT EXISTS idx_goals_title ON public.goals USING btree (title);
-- Add composite index for user+amount queries
CREATE INDEX IF NOT EXISTS idx_goals_user_amount ON public.goals USING btree (user_id, current_amount, target_amount);

-- conversations table indexes
-- Add index for name lookups
CREATE INDEX IF NOT EXISTS idx_conversations_name ON public.conversations USING btree (name);
-- Add index for created_at to optimize time-based queries
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations USING btree (created_at DESC);

-- messages table indexes
-- Alternative index without requiring pg_trgm
CREATE INDEX IF NOT EXISTS idx_messages_content ON public.messages USING btree (content);
-- Add composite index for user+conversation lookups
CREATE INDEX IF NOT EXISTS idx_messages_user_conversation ON public.messages USING btree (user_id, conversation_id);

-- onboarding_profiles table indexes
-- Add composite index for completed profiles by date
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_completed_at ON public.onboarding_profiles USING btree (completed_at DESC) WHERE is_completed = true;

-- public_users table indexes
-- Add index for name lookups
CREATE INDEX IF NOT EXISTS idx_users_name ON public.users USING btree (name);
-- Add index for financial stage queries
CREATE INDEX IF NOT EXISTS idx_users_financial_stage ON public.users USING btree (financial_stage) WHERE financial_stage IS NOT NULL;

-- onboarding_messages table indexes
-- Add index for user_id (missing in schema)
CREATE INDEX IF NOT EXISTS idx_onboarding_messages_user_id ON public.onboarding_messages USING btree (user_id);
-- Add index for created_at
CREATE INDEX IF NOT EXISTS idx_onboarding_messages_created_at ON public.onboarding_messages USING btree (created_at DESC);
-- Add composite index for user+created_at
CREATE INDEX IF NOT EXISTS idx_onboarding_messages_user_created ON public.onboarding_messages USING btree (user_id, created_at DESC);
-- Add index for component_id lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_messages_component_id ON public.onboarding_messages USING btree (component_id) WHERE component_id IS NOT NULL;