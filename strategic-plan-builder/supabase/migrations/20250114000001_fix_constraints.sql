-- Fix constraints for metrics table

-- First, drop existing metric_type constraint
ALTER TABLE public.spb_metrics DROP CONSTRAINT IF EXISTS spb_metrics_metric_type_check;

-- Add new metric_type constraint that includes 'survey'
ALTER TABLE public.spb_metrics 
ADD CONSTRAINT spb_metrics_metric_type_check 
CHECK (metric_type IN ('percent', 'number', 'rating', 'currency', 'status', 'narrative', 'link', 'survey'));

-- Drop the problematic display_width constraint if it exists
ALTER TABLE public.spb_metrics DROP CONSTRAINT IF EXISTS spb_metrics_display_width_check;

-- Add display_width column if it doesn't exist
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS display_width text DEFAULT 'half';

-- Add the correct constraint for display_width values
ALTER TABLE public.spb_metrics
ADD CONSTRAINT spb_metrics_display_width_check 
CHECK (display_width IN ('quarter', 'third', 'half', 'full'));

-- Add other missing columns if they don't exist
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS visualization_type text DEFAULT 'percentage',
ADD COLUMN IF NOT EXISTS visualization_config jsonb;

-- Drop any existing visualization_type constraint
ALTER TABLE public.spb_metrics DROP CONSTRAINT IF EXISTS spb_metrics_visualization_type_check;

-- Add missing columns that are used in the application
ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS timeframe_start integer,
ADD COLUMN IF NOT EXISTS timeframe_end integer,
ADD COLUMN IF NOT EXISTS data_points jsonb,
ADD COLUMN IF NOT EXISTS baseline_value decimal(10,4),
ADD COLUMN IF NOT EXISTS milestone_dates jsonb,
ADD COLUMN IF NOT EXISTS trend_direction text,
ADD COLUMN IF NOT EXISTS collection_frequency text,
ADD COLUMN IF NOT EXISTS data_source_details text,
ADD COLUMN IF NOT EXISTS last_collected timestamp with time zone;

-- Update existing null display_width values to have a default
UPDATE public.spb_metrics 
SET display_width = 'half' 
WHERE display_width IS NULL;