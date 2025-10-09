-- Migration: Add auto-generated flag to staged goals
-- Purpose: Track which goals were auto-created vs uploaded from Excel

ALTER TABLE public.spb_staged_goals
ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.spb_staged_goals.is_auto_generated IS 'Whether this goal was auto-generated (e.g., missing parent placeholder)';
