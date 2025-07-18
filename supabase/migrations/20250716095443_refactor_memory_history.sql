-- Migration: Refactor memory_history table structure
-- Remove embedding, relevance_score columns
-- Extract category from metadata to separate column
-- Remove captured_at (use created_at/updated_at instead)

-- Drop existing table if exists
DROP TABLE IF EXISTS public.memory_history CASCADE;

-- Create new memory_history table with simplified structure
CREATE TABLE public.memory_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  content text NOT NULL,
  category text NULL, -- Extracted from metadata
  metadata jsonb NULL DEFAULT '{}'::jsonb, -- Remaining metadata without category
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT memory_history_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_memory_user_id 
ON public.memory_history USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_memory_created_at 
ON public.memory_history USING btree (created_at DESC) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_memory_updated_at 
ON public.memory_history USING btree (updated_at DESC) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_memory_metadata 
ON public.memory_history USING gin (metadata) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_memory_category 
ON public.memory_history USING btree (category) TABLESPACE pg_default;

-- Add function to update updated_at if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at
CREATE TRIGGER update_memory_history_updated_at 
BEFORE UPDATE ON memory_history 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.memory_history IS 'Simplified user memory storage with AI-generated summaries';
COMMENT ON COLUMN public.memory_history.content IS 'AI-generated summary of user information';
COMMENT ON COLUMN public.memory_history.category IS 'Memory category (e.g., PERSONAL_DEMOGRAPHIC, FINANCIAL_GOALS)';
COMMENT ON COLUMN public.memory_history.metadata IS 'Additional metadata excluding category'; 