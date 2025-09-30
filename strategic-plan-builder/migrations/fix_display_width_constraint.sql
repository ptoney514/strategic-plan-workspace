-- ============================================================================
-- FIX DISPLAY_WIDTH CONSTRAINT ON PRODUCTION
-- ============================================================================
-- This fixes the constraint violation error for display_width column
-- ============================================================================

BEGIN;

-- Step 1: Drop the existing constraint if it exists
ALTER TABLE public.spb_metrics 
DROP CONSTRAINT IF EXISTS spb_metrics_display_width_check;

-- Step 2: Update any existing numeric values to string equivalents
UPDATE public.spb_metrics 
SET display_width = 
  CASE 
    WHEN display_width = '1' THEN 'quarter'
    WHEN display_width = '2' THEN 'third'
    WHEN display_width = '3' THEN 'half'
    WHEN display_width = '4' THEN 'full'
    ELSE COALESCE(display_width, 'half')
  END
WHERE display_width IN ('1', '2', '3', '4');

-- Step 3: Add the correct constraint with string values
ALTER TABLE public.spb_metrics
ADD CONSTRAINT spb_metrics_display_width_check 
CHECK (display_width IN ('quarter', 'third', 'half', 'full'));

-- Step 4: Set default for any null values
UPDATE public.spb_metrics 
SET display_width = 'half' 
WHERE display_width IS NULL;

-- Verify the changes
SELECT 
  COUNT(*) as total_metrics,
  COUNT(display_width) as has_display_width,
  COUNT(CASE WHEN display_width IN ('quarter', 'third', 'half', 'full') THEN 1 END) as valid_display_width
FROM public.spb_metrics;

COMMIT;

-- Show the current constraint definition
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'spb_metrics_display_width_check';