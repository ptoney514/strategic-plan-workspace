-- Fix Metrics Table Constraints for Production
-- This script ensures all NOT NULL constraints have appropriate defaults

-- First, let's check what columns exist and their constraints
-- Run this query first to see the current state:
/*
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'spb_metrics'
ORDER BY ordinal_position;
*/

-- Add default values for columns that might be NOT NULL without defaults
ALTER TABLE public.spb_metrics 
ALTER COLUMN name SET DEFAULT 'New Metric',
ALTER COLUMN metric_type SET DEFAULT 'percent';

-- Ensure measure_title and measure_unit have defaults if they exist and are NOT NULL
DO $$ 
BEGIN
    -- Check if measure_title exists and set default
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'spb_metrics' 
        AND column_name = 'measure_title'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.spb_metrics 
        ALTER COLUMN measure_title SET DEFAULT 'Metric';
    END IF;

    -- Check if measure_unit exists and set default
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'spb_metrics' 
        AND column_name = 'measure_unit'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.spb_metrics 
        ALTER COLUMN measure_unit SET DEFAULT '%';
    END IF;

    -- Check if unit exists (legacy field) and set default
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'spb_metrics' 
        AND column_name = 'unit'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.spb_metrics 
        ALTER COLUMN unit SET DEFAULT '%';
    END IF;

    -- Check if display_order exists and set default
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'spb_metrics' 
        AND column_name = 'display_order'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.spb_metrics 
        ALTER COLUMN display_order SET DEFAULT 0;
    END IF;

    -- Check if decimal_places exists and set default
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'spb_metrics' 
        AND column_name = 'decimal_places'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.spb_metrics 
        ALTER COLUMN decimal_places SET DEFAULT 0;
    END IF;

    -- Check if show_percentage exists and set default
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'spb_metrics' 
        AND column_name = 'show_percentage'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.spb_metrics 
        ALTER COLUMN show_percentage SET DEFAULT false;
    END IF;
END $$;

-- Set defaults for columns added in recent migrations
ALTER TABLE public.spb_metrics 
ALTER COLUMN metric_category SET DEFAULT 'other',
ALTER COLUMN collection_frequency SET DEFAULT 'quarterly',
ALTER COLUMN is_higher_better SET DEFAULT true,
ALTER COLUMN trend_direction SET DEFAULT 'stable';

-- Add missing display fields if they don't exist
DO $$ 
BEGIN
    -- Add display_width if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'spb_metrics' 
        AND column_name = 'display_width'
    ) THEN
        ALTER TABLE public.spb_metrics 
        ADD COLUMN display_width text DEFAULT 'full';
        
        ALTER TABLE public.spb_metrics
        ADD CONSTRAINT spb_metrics_display_width_check 
        CHECK (display_width IN ('full', 'half', 'third', 'quarter'));
    END IF;

    -- Add description if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'spb_metrics' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.spb_metrics 
        ADD COLUMN description text;
    END IF;

    -- Add visualization_type if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'spb_metrics' 
        AND column_name = 'visualization_type'
    ) THEN
        ALTER TABLE public.spb_metrics 
        ADD COLUMN visualization_type text DEFAULT 'progress';
    END IF;

    -- Add visualization_config if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'spb_metrics' 
        AND column_name = 'visualization_config'
    ) THEN
        ALTER TABLE public.spb_metrics 
        ADD COLUMN visualization_config jsonb;
    END IF;
END $$;

-- Make current_value and target_value nullable OR provide defaults
-- (metrics might not have values when first created)
ALTER TABLE public.spb_metrics 
ALTER COLUMN current_value SET DEFAULT 0,
ALTER COLUMN target_value SET DEFAULT 100;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'spb_metrics'
    AND (is_nullable = 'NO' OR column_default IS NOT NULL)
ORDER BY ordinal_position;