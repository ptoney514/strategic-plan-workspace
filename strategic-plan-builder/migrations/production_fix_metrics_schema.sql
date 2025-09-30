-- ============================================================================
-- PRODUCTION DATABASE FIX FOR METRICS SCHEMA
-- ============================================================================
-- This script safely updates the production Supabase database to match the
-- local development schema that is working correctly.
-- 
-- Apply this to: qsftokjevxueboldvmzc.supabase.co
-- Date: 2025-09-16
-- ============================================================================

-- Start transaction for safety
BEGIN;

-- ============================================================================
-- STEP 1: Add missing columns with safe defaults
-- ============================================================================

-- Add display_width column (used for UI layout)
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS display_width text DEFAULT 'half';

-- Add description column (for metric descriptions)
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS description text;

-- Add visualization columns (for chart configuration)
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS visualization_type text DEFAULT 'progress',
ADD COLUMN IF NOT EXISTS visualization_config jsonb;

-- Add tracking and metadata columns
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS baseline_value decimal(10,4),
ADD COLUMN IF NOT EXISTS milestone_dates jsonb,
ADD COLUMN IF NOT EXISTS trend_direction text DEFAULT 'stable',
ADD COLUMN IF NOT EXISTS collection_frequency text DEFAULT 'quarterly',
ADD COLUMN IF NOT EXISTS data_source_details text,
ADD COLUMN IF NOT EXISTS last_collected timestamp with time zone;

-- Add time series columns
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS timeframe_start integer,
ADD COLUMN IF NOT EXISTS timeframe_end integer,
ADD COLUMN IF NOT EXISTS data_points jsonb;

-- Add category and risk threshold columns
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS metric_category varchar(50) DEFAULT 'other',
ADD COLUMN IF NOT EXISTS risk_threshold_critical decimal(10,4),
ADD COLUMN IF NOT EXISTS risk_threshold_off_target decimal(10,4),
ADD COLUMN IF NOT EXISTS is_higher_better boolean DEFAULT true;

-- Add survey-specific columns
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS survey_primary_source decimal(10,4),
ADD COLUMN IF NOT EXISTS survey_data_source decimal(10,4),
ADD COLUMN IF NOT EXISTS survey_source_label varchar(255),
ADD COLUMN IF NOT EXISTS narrative_text text,
ADD COLUMN IF NOT EXISTS chart_start_year integer,
ADD COLUMN IF NOT EXISTS chart_end_year integer,
ADD COLUMN IF NOT EXISTS survey_scale_max decimal(10,2) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS survey_scale_min decimal(10,2) DEFAULT 1.0;

-- ============================================================================
-- STEP 2: Fix constraints (drop and recreate with correct values)
-- ============================================================================

-- Fix metric_type constraint to include 'survey'
ALTER TABLE public.spb_metrics 
DROP CONSTRAINT IF EXISTS spb_metrics_metric_type_check;

ALTER TABLE public.spb_metrics 
ADD CONSTRAINT spb_metrics_metric_type_check 
CHECK (metric_type IN ('percent', 'number', 'rating', 'currency', 'status', 'narrative', 'link', 'survey'));

-- Fix display_width constraint with correct values
ALTER TABLE public.spb_metrics 
DROP CONSTRAINT IF EXISTS spb_metrics_display_width_check;

ALTER TABLE public.spb_metrics
ADD CONSTRAINT spb_metrics_display_width_check 
CHECK (display_width IN ('quarter', 'third', 'half', 'full'));

-- Add metric_category constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'spb_metrics_category_check'
    ) THEN
        ALTER TABLE public.spb_metrics 
        ADD CONSTRAINT spb_metrics_category_check 
        CHECK (metric_category IN ('enrollment', 'achievement', 'discipline', 'attendance', 'culture', 'other'));
    END IF;
END $$;

-- Add trend_direction constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'spb_metrics_trend_direction_check'
    ) THEN
        ALTER TABLE public.spb_metrics
        ADD CONSTRAINT spb_metrics_trend_direction_check
        CHECK (trend_direction IN ('improving', 'stable', 'declining'));
    END IF;
END $$;

-- Add collection_frequency constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'spb_metrics_collection_frequency_check'
    ) THEN
        ALTER TABLE public.spb_metrics
        ADD CONSTRAINT spb_metrics_collection_frequency_check  
        CHECK (collection_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually'));
    END IF;
END $$;

-- ============================================================================
-- STEP 3: Update existing data to ensure compatibility
-- ============================================================================

-- Update any NULL display_width values to default
UPDATE public.spb_metrics 
SET display_width = 'half' 
WHERE display_width IS NULL;

-- Update any NULL visualization_type values to default
UPDATE public.spb_metrics 
SET visualization_type = 'progress' 
WHERE visualization_type IS NULL;

-- Update any NULL trend_direction values to default
UPDATE public.spb_metrics 
SET trend_direction = 'stable' 
WHERE trend_direction IS NULL;

-- Update any NULL collection_frequency values to default
UPDATE public.spb_metrics 
SET collection_frequency = 'quarterly' 
WHERE collection_frequency IS NULL;

-- Update any NULL metric_category values to default
UPDATE public.spb_metrics 
SET metric_category = 'other' 
WHERE metric_category IS NULL;

-- Update any NULL is_higher_better values to default
UPDATE public.spb_metrics 
SET is_higher_better = true 
WHERE is_higher_better IS NULL;

-- Update any NULL is_primary values to default
UPDATE public.spb_metrics 
SET is_primary = false 
WHERE is_primary IS NULL;

-- Update any NULL display_order values to default
UPDATE public.spb_metrics 
SET display_order = 0 
WHERE display_order IS NULL;

-- ============================================================================
-- STEP 4: Create indexes for better performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_spb_metrics_category 
ON public.spb_metrics(metric_category);

CREATE INDEX IF NOT EXISTS idx_spb_metrics_frequency 
ON public.spb_metrics(collection_frequency);

CREATE INDEX IF NOT EXISTS idx_spb_metrics_display_order 
ON public.spb_metrics(display_order);

CREATE INDEX IF NOT EXISTS idx_spb_metrics_goal_id 
ON public.spb_metrics(goal_id);

-- ============================================================================
-- STEP 5: Create survey data table if it doesn't exist
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.spb_metric_survey_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_id UUID NOT NULL REFERENCES public.spb_metrics(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  category VARCHAR(100),
  primary_value DECIMAL(10,4),
  data_value DECIMAL(10,4),
  survey_value DECIMAL(10,4),
  response_count INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(metric_id, year, category)
);

-- Create index for survey data
CREATE INDEX IF NOT EXISTS idx_spb_metric_survey_data_metric_year 
ON public.spb_metric_survey_data(metric_id, year);

-- ============================================================================
-- STEP 6: Enable Row Level Security (if not already enabled)
-- ============================================================================

-- Enable RLS on survey data table
ALTER TABLE public.spb_metric_survey_data ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'spb_metric_survey_data' 
        AND policyname = 'Allow public read access to survey data'
    ) THEN
        CREATE POLICY "Allow public read access to survey data" 
        ON public.spb_metric_survey_data
        FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'spb_metric_survey_data' 
        AND policyname = 'Allow public write access to survey data'
    ) THEN
        CREATE POLICY "Allow public write access to survey data" 
        ON public.spb_metric_survey_data
        FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ============================================================================
-- STEP 7: Create helpful view for metric status calculation
-- ============================================================================

DROP VIEW IF EXISTS public.metrics_with_status CASCADE;

CREATE OR REPLACE VIEW public.metrics_with_status AS
SELECT 
  m.*,
  CASE 
    WHEN m.current_value IS NULL OR m.target_value IS NULL THEN 'no-data'
    WHEN m.is_higher_better THEN
      CASE 
        WHEN (m.current_value / NULLIF(m.target_value, 0)) >= COALESCE(m.risk_threshold_off_target, 0.9) THEN 'on-target'
        WHEN (m.current_value / NULLIF(m.target_value, 0)) >= COALESCE(m.risk_threshold_critical, 0.7) THEN 'off-target'
        ELSE 'critical'
      END
    ELSE 
      CASE 
        WHEN (m.current_value / NULLIF(m.target_value, 0)) <= COALESCE(m.risk_threshold_off_target, 1.1) THEN 'on-target'
        WHEN (m.current_value / NULLIF(m.target_value, 0)) <= COALESCE(m.risk_threshold_critical, 1.3) THEN 'off-target'
        ELSE 'critical'
      END
  END as calculated_status
FROM public.spb_metrics m;

-- Add comment explaining the view
COMMENT ON VIEW public.metrics_with_status IS 
'Metrics with automatically calculated status based on current vs target values and risk thresholds';

-- ============================================================================
-- STEP 8: Create or update trigger for survey data updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_survey_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS set_survey_data_updated_at ON public.spb_metric_survey_data;

CREATE TRIGGER set_survey_data_updated_at
  BEFORE UPDATE ON public.spb_metric_survey_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_survey_data_updated_at();

-- ============================================================================
-- STEP 9: Verify the migration
-- ============================================================================

-- Check that all columns exist
DO $$
DECLARE
    missing_columns text := '';
    required_columns text[] := ARRAY[
        'display_width', 'description', 'visualization_type', 'visualization_config',
        'is_primary', 'display_order', 'baseline_value', 'milestone_dates',
        'trend_direction', 'collection_frequency', 'data_source_details', 
        'last_collected', 'timeframe_start', 'timeframe_end', 'data_points',
        'metric_category', 'risk_threshold_critical', 'risk_threshold_off_target',
        'is_higher_better', 'survey_primary_source', 'survey_data_source',
        'survey_source_label', 'narrative_text', 'chart_start_year', 'chart_end_year',
        'survey_scale_max', 'survey_scale_min'
    ];
    col text;
BEGIN
    FOREACH col IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'spb_metrics' 
            AND column_name = col
        ) THEN
            missing_columns := missing_columns || col || ', ';
        END IF;
    END LOOP;
    
    IF missing_columns != '' THEN
        RAISE WARNING 'Missing columns after migration: %', missing_columns;
    ELSE
        RAISE NOTICE 'All required columns exist successfully!';
    END IF;
END $$;

-- Show final column structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'spb_metrics' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show constraint information
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.spb_metrics'::regclass
ORDER BY conname;

-- Commit the transaction
COMMIT;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT 
    '✅ Production database schema fix completed successfully!' AS status,
    COUNT(*) AS total_metrics,
    COUNT(DISTINCT goal_id) AS unique_goals
FROM public.spb_metrics;