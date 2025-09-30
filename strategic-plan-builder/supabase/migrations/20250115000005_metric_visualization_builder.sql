-- Add visualization type and config support for metric builder wizard

-- Add new columns to spb_metrics table for visualization builder
ALTER TABLE public.spb_metrics 
ADD COLUMN IF NOT EXISTS visualization_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS visualization_config JSONB;

-- Add constraint for visualization_type enum
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'spb_metrics_visualization_type_check'
    ) THEN
        ALTER TABLE public.spb_metrics
        ADD CONSTRAINT spb_metrics_visualization_type_check
        CHECK (visualization_type IN (
            'percentage', 
            'number', 
            'bar-chart', 
            'line-chart', 
            'donut-chart', 
            'gauge', 
            'survey', 
            'status',
            'progress',
            'performance-trend'
        ));
    END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_spb_metrics_visualization_type 
ON public.spb_metrics(visualization_type);

-- Add comment to explain the new columns
COMMENT ON COLUMN public.spb_metrics.visualization_type IS 'Type of visualization for metric display (percentage, bar-chart, etc.)';
COMMENT ON COLUMN public.spb_metrics.visualization_config IS 'JSON configuration for the visualization including data, labels, and display options';