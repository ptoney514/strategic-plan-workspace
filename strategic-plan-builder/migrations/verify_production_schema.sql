-- ============================================================================
-- PRODUCTION DATABASE SCHEMA VERIFICATION
-- ============================================================================
-- Run this BEFORE applying the fix to understand the current state
-- Apply to: qsftokjevxueboldvmzc.supabase.co
-- ============================================================================

-- Check existing columns in spb_metrics table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'spb_metrics' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check existing constraints
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.spb_metrics'::regclass
ORDER BY conname;

-- Check if survey data table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'spb_metric_survey_data'
) AS survey_table_exists;

-- Check for any failing metrics (to understand error patterns)
SELECT 
    id,
    name,
    metric_type,
    display_width,
    visualization_type,
    created_at
FROM public.spb_metrics
ORDER BY created_at DESC
LIMIT 10;

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'spb_metrics'
AND schemaname = 'public';

-- Count metrics by type to understand data
SELECT 
    metric_type,
    COUNT(*) as count
FROM public.spb_metrics
GROUP BY metric_type
ORDER BY count DESC;

-- Check for any metrics with potentially problematic data
SELECT 
    id,
    name,
    metric_type,
    CASE 
        WHEN display_width IS NULL THEN 'NULL display_width'
        WHEN visualization_type IS NULL THEN 'NULL visualization_type'
        ELSE 'OK'
    END as issue
FROM public.spb_metrics
WHERE display_width IS NULL 
   OR visualization_type IS NULL
LIMIT 20;