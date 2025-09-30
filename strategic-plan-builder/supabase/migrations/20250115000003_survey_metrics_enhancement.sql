-- Survey Metrics Enhancement Migration
-- Adds support for survey-specific metrics with multiple data sources and bar chart visualization

-- Add survey-specific columns to spb_metrics table
ALTER TABLE public.spb_metrics 
ADD COLUMN IF NOT EXISTS survey_primary_source DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS survey_data_source DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS survey_source_label VARCHAR(255),
ADD COLUMN IF NOT EXISTS narrative_text TEXT,
ADD COLUMN IF NOT EXISTS chart_start_year INTEGER,
ADD COLUMN IF NOT EXISTS chart_end_year INTEGER,
ADD COLUMN IF NOT EXISTS survey_scale_max DECIMAL(10,2) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS survey_scale_min DECIMAL(10,2) DEFAULT 1.0;

-- Create table for survey response categories (for detailed breakdowns)
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

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_spb_metric_survey_data_metric_year 
ON public.spb_metric_survey_data(metric_id, year);

-- Add RLS policies for survey data table
ALTER TABLE public.spb_metric_survey_data ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for development)
CREATE POLICY "Allow public read access to survey data" ON public.spb_metric_survey_data
  FOR SELECT USING (true);

-- Allow public insert/update/delete (for development)
CREATE POLICY "Allow public write access to survey data" ON public.spb_metric_survey_data
  FOR ALL USING (true) WITH CHECK (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_survey_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_survey_data_updated_at
  BEFORE UPDATE ON public.spb_metric_survey_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_survey_data_updated_at();

-- Add sample survey data for testing with Goal 1.1
-- This will be inserted after we identify the correct goal