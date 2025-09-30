-- ============================================================================
-- URGENT FIX: DISPLAY_WIDTH CONSTRAINT VIOLATION
-- ============================================================================
-- Run this IMMEDIATELY in Supabase SQL Editor to fix the constraint error
-- ============================================================================

-- First, check what constraint currently exists
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as current_constraint_definition
FROM pg_constraint
WHERE conname = 'spb_metrics_display_width_check';

-- Drop ALL constraints on display_width to start fresh
ALTER TABLE public.spb_metrics 
DROP CONSTRAINT IF EXISTS spb_metrics_display_width_check CASCADE;

-- Check if the column exists and what values it currently has
SELECT DISTINCT display_width, COUNT(*) as count
FROM public.spb_metrics
GROUP BY display_width
ORDER BY display_width;

-- Add the column if it doesn't exist
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS display_width text;

-- Update any invalid values to valid ones
UPDATE public.spb_metrics 
SET display_width = 
  CASE 
    WHEN display_width = '1' OR display_width = '25' OR display_width = 'quarter' THEN 'quarter'
    WHEN display_width = '2' OR display_width = '33' OR display_width = 'third' THEN 'third'
    WHEN display_width = '3' OR display_width = '50' OR display_width = 'half' THEN 'half'
    WHEN display_width = '4' OR display_width = '100' OR display_width = 'full' THEN 'full'
    WHEN display_width IS NULL THEN 'half'
    ELSE 'half'  -- Default any other values to 'half'
  END;

-- Now add the correct constraint
ALTER TABLE public.spb_metrics
ADD CONSTRAINT spb_metrics_display_width_check 
CHECK (display_width IN ('quarter', 'third', 'half', 'full'));

-- Verify the fix
SELECT 
  'Constraint Fixed!' as status,
  COUNT(*) as total_metrics,
  COUNT(DISTINCT display_width) as unique_widths,
  string_agg(DISTINCT display_width, ', ') as width_values
FROM public.spb_metrics;

-- Show the new constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as new_constraint_definition
FROM pg_constraint
WHERE conname = 'spb_metrics_display_width_check';