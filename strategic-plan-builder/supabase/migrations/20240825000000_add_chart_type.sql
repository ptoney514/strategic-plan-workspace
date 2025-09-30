-- Migration: Add chart_type field to spb_metrics table
-- Allows administrators to choose the visualization type for each metric

BEGIN;

-- Add chart_type column to metrics table
ALTER TABLE spb_metrics 
ADD COLUMN IF NOT EXISTS chart_type TEXT DEFAULT 'line' 
CHECK (chart_type IN ('line', 'bar', 'donut', 'area'));

-- Add index for chart_type for faster queries if needed
CREATE INDEX IF NOT EXISTS idx_metrics_chart_type ON spb_metrics(chart_type);

-- Update existing metrics to have default chart_type based on metric_type
UPDATE spb_metrics 
SET chart_type = CASE 
    WHEN metric_type = 'percent' THEN 'donut'
    WHEN metric_type = 'rating' THEN 'bar'
    WHEN metric_type = 'number' THEN 'line'
    WHEN metric_type = 'currency' THEN 'area'
    ELSE 'line'
END
WHERE chart_type IS NULL;

COMMIT;