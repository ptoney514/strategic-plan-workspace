-- ============================================================================
-- FINAL VERIFICATION AND FIX
-- ============================================================================
-- Run this to verify the constraint is correct and fix any remaining issues
-- ============================================================================

-- 1. Check current constraint (should show the new string values)
SELECT 
  'Current Constraint:' as check_type,
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'spb_metrics_display_width_check';

-- 2. Check if display_width column exists and its type
SELECT 
  'Column Info:' as check_type,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'spb_metrics' 
  AND column_name = 'display_width';

-- 3. If constraint still shows old values, force fix it:
DO $$
BEGIN
  -- Check if constraint exists with wrong definition
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'spb_metrics_display_width_check'
    AND pg_get_constraintdef(oid) NOT LIKE '%quarter%'
  ) THEN
    -- Drop and recreate
    ALTER TABLE public.spb_metrics DROP CONSTRAINT spb_metrics_display_width_check;
    ALTER TABLE public.spb_metrics ADD CONSTRAINT spb_metrics_display_width_check 
      CHECK (display_width IN ('quarter', 'third', 'half', 'full'));
    RAISE NOTICE 'Constraint was wrong, fixed it!';
  ELSE
    RAISE NOTICE 'Constraint is already correct';
  END IF;
END $$;

-- 4. Ensure all required columns exist
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS visualization_type text DEFAULT 'progress',
ADD COLUMN IF NOT EXISTS visualization_config jsonb;

-- 5. Final verification
SELECT 
  'Final Check:' as status,
  EXISTS(SELECT 1 FROM pg_constraint WHERE conname = 'spb_metrics_display_width_check') as constraint_exists,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'spb_metrics' AND column_name = 'display_width') as column_exists,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'spb_metrics' AND column_name = 'description') as description_exists;

-- 6. Test insert (this should work)
INSERT INTO public.spb_metrics (
  id, goal_id, metric_name, metric_type, 
  current_value, target_value, unit, 
  display_width, created_at, updated_at
)
VALUES (
  gen_random_uuid(), 
  (SELECT id FROM spb_goals LIMIT 1),
  'Test Metric - Delete Me',
  'percent',
  50,
  100,
  '%',
  'half',  -- This should work now!
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 7. Clean up test
DELETE FROM public.spb_metrics WHERE metric_name = 'Test Metric - Delete Me';

SELECT 'All checks complete! If test insert worked, the database is fixed.' as final_status;