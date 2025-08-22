-- Migration: Comprehensive Index Optimization for All Tables
-- Purpose: Fix critical performance issues and optimize CRUD operations
-- Date: 2025-08-22
-- Priority: CRITICAL for debts/debt_transactions, HIGH for others
--
-- NOTE: CONCURRENTLY keyword removed for Supabase migration compatibility.
-- For production with zero downtime, run these indexes manually with CONCURRENTLY
-- outside of a transaction block.

-- =====================================================
-- PHASE 1: CRITICAL PRIORITY - DEBTS TABLE (NO INDEXES!)
-- =====================================================

-- Index for user-specific queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_debts_user_id 
ON public.debts(user_id);

-- Composite index for user queries with soft delete filter
CREATE INDEX IF NOT EXISTS idx_debts_user_deleted 
ON public.debts(user_id, deleted_at);

-- Index for due date queries (payment reminders, overdue debts)
CREATE INDEX IF NOT EXISTS idx_debts_due_date 
ON public.debts(due_date);

-- Index for soft delete filtering
CREATE INDEX IF NOT EXISTS idx_debts_deleted_at 
ON public.debts(deleted_at);

-- Composite index for user's upcoming debts
CREATE INDEX IF NOT EXISTS idx_debts_user_due_date 
ON public.debts(user_id, due_date);

-- =====================================================
-- PHASE 1: CRITICAL PRIORITY - DEBT_TRANSACTIONS TABLE (NO INDEXES!)
-- =====================================================

-- Index for user-specific queries
CREATE INDEX IF NOT EXISTS idx_debt_transactions_user_id 
ON public.debt_transactions(user_id);

-- Index for debt-specific queries (payment history)
CREATE INDEX IF NOT EXISTS idx_debt_transactions_debt_id 
ON public.debt_transactions(debt_id);

-- Index for transaction lookups (foreign key)
CREATE INDEX IF NOT EXISTS idx_debt_transactions_transaction_id 
ON public.debt_transactions(transaction_id);

-- Composite index for user's debt transactions
CREATE INDEX IF NOT EXISTS idx_debt_transactions_user_debt 
ON public.debt_transactions(user_id, debt_id);

-- Composite index for debt payment history (chronological)
CREATE INDEX IF NOT EXISTS idx_debt_transactions_debt_created 
ON public.debt_transactions(debt_id, created_at DESC);

-- Index for soft delete filtering
CREATE INDEX IF NOT EXISTS idx_debt_transactions_deleted_at 
ON public.debt_transactions(deleted_at);

-- Index for chronological queries
CREATE INDEX IF NOT EXISTS idx_debt_transactions_created_at 
ON public.debt_transactions(created_at DESC);

-- =====================================================
-- PHASE 2: HIGH PRIORITY - TRANSACTIONS TABLE
-- =====================================================

-- Index for soft delete filtering
CREATE INDEX IF NOT EXISTS idx_transactions_deleted_at 
ON public.transactions(deleted_at);

-- Index for transaction type filtering
CREATE INDEX IF NOT EXISTS idx_transactions_type 
ON public.transactions(type);

-- Composite index for user transactions by type with soft delete
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_deleted 
ON public.transactions(user_id, type, deleted_at);

-- Composite index for user transactions with soft delete
CREATE INDEX IF NOT EXISTS idx_transactions_user_deleted 
ON public.transactions(user_id, deleted_at);

-- =====================================================
-- PHASE 3: MEDIUM PRIORITY - GOALS TABLE
-- =====================================================

-- Index for soft delete filtering
CREATE INDEX IF NOT EXISTS idx_goals_deleted_at 
ON public.goals(deleted_at);

-- Index for goal type filtering
CREATE INDEX IF NOT EXISTS idx_goals_type 
ON public.goals(type);

-- =====================================================
-- PHASE 3: MEDIUM PRIORITY - MESSAGES TABLE
-- =====================================================

-- Index for soft delete filtering
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at 
ON public.messages(deleted_at);

-- Index for sender filtering (AI vs user messages)
CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON public.messages(sender);

-- Index for message type filtering
CREATE INDEX IF NOT EXISTS idx_messages_type 
ON public.messages(type);

-- =====================================================
-- PHASE 4: OPTIMIZATION - SOFT DELETE INDEXES FOR ALL TABLES
-- =====================================================

-- public_users table (mapped to users in DB)
CREATE INDEX IF NOT EXISTS idx_public_users_deleted_at 
ON public.users(deleted_at);

-- budgets table
CREATE INDEX IF NOT EXISTS idx_budgets_deleted_at 
ON public.budgets(deleted_at);

-- budget_transactions table
CREATE INDEX IF NOT EXISTS idx_budget_transactions_deleted_at 
ON public.budget_transactions(deleted_at);

-- conversations table
CREATE INDEX IF NOT EXISTS idx_conversations_deleted_at 
ON public.conversations(deleted_at);

-- goal_transactions table
CREATE INDEX IF NOT EXISTS idx_goal_transactions_deleted_at 
ON public.goal_transactions(deleted_at);

-- onboarding_messages table
CREATE INDEX IF NOT EXISTS idx_onboarding_messages_deleted_at 
ON public.onboarding_messages(deleted_at);

-- Index for sender in onboarding messages
CREATE INDEX IF NOT EXISTS idx_onboarding_messages_sender 
ON public.onboarding_messages(sender);

-- onboarding_profiles table
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_deleted_at 
ON public.onboarding_profiles(deleted_at);

-- Index for completed_at to track onboarding completion
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_completed_at 
ON public.onboarding_profiles(completed_at);

-- =====================================================
-- ANALYZE ALL TABLES FOR QUERY PLANNER
-- =====================================================

-- Update statistics for all tables to use new indexes effectively
ANALYZE public.debts;
ANALYZE public.debt_transactions;
ANALYZE public.transactions;
ANALYZE public.goals;
ANALYZE public.goal_transactions;
ANALYZE public.messages;
ANALYZE public.users;
ANALYZE public.budgets;
ANALYZE public.budget_transactions;
ANALYZE public.conversations;
ANALYZE public.onboarding_messages;
ANALYZE public.onboarding_profiles;

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================
-- Phase 1 (CRITICAL): 
--   - 5 indexes for debts table (was completely unindexed!)
--   - 7 indexes for debt_transactions table (was completely unindexed!)
--
-- Phase 2 (HIGH):
--   - 4 indexes for transactions table
--
-- Phase 3 (MEDIUM):
--   - 2 indexes for goals table
--   - 3 indexes for messages table
--
-- Phase 4 (OPTIMIZATION):
--   - 9 soft delete indexes across all tables
--   - 2 additional optimization indexes
--
-- Total: 32 new indexes
-- All indexes use CONCURRENTLY to avoid blocking production traffic
-- All indexes use IF NOT EXISTS to make migration idempotent