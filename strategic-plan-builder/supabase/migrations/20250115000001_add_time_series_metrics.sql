-- Enhanced Time-Series Metrics Support
-- Adds support for quarterly/monthly/annual tracking with actual vs target values

-- Create a table for time-series metric data
CREATE TABLE IF NOT EXISTS public.spb_metric_time_series (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_id UUID NOT NULL REFERENCES public.spb_metrics(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL, -- '2024', '2024-Q1', '2024-01', etc.
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('annual', 'quarterly', 'monthly')),
    target_value DECIMAL(10,2),
    actual_value DECIMAL(10,2),
    status VARCHAR(20) CHECK (status IN ('on-target', 'off-target', 'critical', 'no-data')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(metric_id, period)
);

-- Add missing columns to spb_metrics if they don't exist
ALTER TABLE public.spb_metrics 
ADD COLUMN IF NOT EXISTS measure_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS measure_unit VARCHAR(50),
ADD COLUMN IF NOT EXISTS decimal_places INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS show_percentage BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS aggregation_method VARCHAR(20) DEFAULT 'average' CHECK (aggregation_method IN ('average', 'sum', 'latest', 'max', 'min'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_metric_time_series_metric_id ON public.spb_metric_time_series(metric_id);
CREATE INDEX IF NOT EXISTS idx_metric_time_series_period ON public.spb_metric_time_series(period);
CREATE INDEX IF NOT EXISTS idx_metric_time_series_status ON public.spb_metric_time_series(status);

-- Enable RLS
ALTER TABLE public.spb_metric_time_series ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for development
CREATE POLICY "Enable all access for development" 
ON public.spb_metric_time_series FOR ALL 
USING (true) 
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.spb_metric_time_series TO anon, authenticated;

-- Function to calculate metric status based on actual vs target
CREATE OR REPLACE FUNCTION calculate_metric_status(
    actual DECIMAL,
    target DECIMAL,
    is_higher_better BOOLEAN DEFAULT true,
    critical_threshold DECIMAL DEFAULT NULL,
    off_target_threshold DECIMAL DEFAULT NULL
) RETURNS VARCHAR AS $$
DECLARE
    performance_ratio DECIMAL;
    critical_thresh DECIMAL;
    off_target_thresh DECIMAL;
BEGIN
    -- Handle null values
    IF actual IS NULL OR target IS NULL OR target = 0 THEN
        RETURN 'no-data';
    END IF;
    
    performance_ratio := actual / target;
    
    -- Use custom thresholds or defaults
    IF is_higher_better THEN
        critical_thresh := COALESCE(critical_threshold, 0.7);
        off_target_thresh := COALESCE(off_target_threshold, 0.9);
        
        IF performance_ratio >= off_target_thresh THEN
            RETURN 'on-target';
        ELSIF performance_ratio >= critical_thresh THEN
            RETURN 'off-target';
        ELSE
            RETURN 'critical';
        END IF;
    ELSE
        -- For metrics where lower is better
        critical_thresh := COALESCE(critical_threshold, 1.3);
        off_target_thresh := COALESCE(off_target_threshold, 1.1);
        
        IF performance_ratio <= off_target_thresh THEN
            RETURN 'on-target';
        ELSIF performance_ratio <= critical_thresh THEN
            RETURN 'off-target';
        ELSE
            RETURN 'critical';
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate child metrics status for parent goals
CREATE OR REPLACE FUNCTION aggregate_child_metrics_status(parent_goal_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    child_statuses VARCHAR[];
    status VARCHAR;
BEGIN
    -- Get all child goal metrics statuses
    SELECT ARRAY_AGG(
        calculate_metric_status(
            m.current_value,
            m.target_value,
            COALESCE(m.is_higher_better, true),
            m.risk_threshold_critical,
            m.risk_threshold_off_target
        )
    ) INTO child_statuses
    FROM spb_metrics m
    JOIN spb_goals g ON m.goal_id = g.id
    WHERE g.parent_id = parent_goal_id;
    
    -- If no child metrics, return no-data
    IF child_statuses IS NULL OR array_length(child_statuses, 1) = 0 THEN
        RETURN 'no-data';
    END IF;
    
    -- Aggregation logic: worst status wins
    IF 'critical' = ANY(child_statuses) THEN
        RETURN 'critical';
    ELSIF 'off-target' = ANY(child_statuses) THEN
        RETURN 'off-target';
    ELSIF 'on-target' = ANY(child_statuses) THEN
        RETURN 'on-target';
    ELSE
        RETURN 'no-data';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Add sample time series data for demonstration
-- This will be populated with actual data in production
COMMENT ON TABLE public.spb_metric_time_series IS 'Time-series data for metrics tracking actual vs target values over time';
COMMENT ON COLUMN public.spb_metric_time_series.period IS 'Time period identifier (e.g., 2024, 2024-Q1, 2024-01)';
COMMENT ON COLUMN public.spb_metric_time_series.period_type IS 'Type of period: annual, quarterly, or monthly';

SELECT 'Time-series metrics migration completed successfully!' as message;