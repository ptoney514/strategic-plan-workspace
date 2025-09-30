-- Create fresh tables with spb_ prefix to avoid RLS conflicts
-- Run this in Supabase Dashboard SQL Editor

-- Drop old tables if they exist (careful - this will delete data!)
DROP TABLE IF EXISTS public.metrics CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;  
DROP TABLE IF EXISTS public.districts CASCADE;
DROP TABLE IF EXISTS strategic_plan_builder.metrics CASCADE;
DROP TABLE IF EXISTS strategic_plan_builder.goals CASCADE;
DROP TABLE IF EXISTS strategic_plan_builder.districts CASCADE;

-- Drop old schema if it exists
DROP SCHEMA IF EXISTS strategic_plan_builder CASCADE;

-- Create new tables with spb_ prefix in public schema
CREATE TABLE public.spb_districts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#0099CC',
    secondary_color VARCHAR(7) DEFAULT '#51d01b',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_email VARCHAR,
    is_public BOOLEAN DEFAULT true
);

CREATE TABLE public.spb_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    district_id UUID NOT NULL REFERENCES public.spb_districts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.spb_goals(id) ON DELETE CASCADE,
    goal_number VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    level INTEGER DEFAULT 0,
    order_position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.spb_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES public.spb_goals(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    metric_type VARCHAR CHECK (metric_type IN ('percent', 'number', 'rating', 'currency', 'status', 'narrative', 'link')) DEFAULT 'percent',
    data_source VARCHAR CHECK (data_source IN ('survey', 'map_data', 'state_testing', 'total_number', 'percent', 'narrative', 'link')) DEFAULT 'survey',
    current_value DECIMAL,
    target_value DECIMAL,
    unit VARCHAR,
    timeframe_start INTEGER,
    timeframe_end INTEGER,
    data_points JSONB,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.spb_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_metrics ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development (allows all operations)
CREATE POLICY "Enable all access for development" 
ON public.spb_districts FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all access for development" 
ON public.spb_goals FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all access for development" 
ON public.spb_metrics FOR ALL 
USING (true) 
WITH CHECK (true);

-- Grant comprehensive permissions to anon and authenticated roles
GRANT ALL ON public.spb_districts TO anon, authenticated;
GRANT ALL ON public.spb_goals TO anon, authenticated;
GRANT ALL ON public.spb_metrics TO anon, authenticated;

-- Grant sequence usage for auto-increment IDs
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create indexes for better performance
CREATE INDEX idx_spb_goals_district_id ON public.spb_goals(district_id);
CREATE INDEX idx_spb_goals_parent_id ON public.spb_goals(parent_id);
CREATE INDEX idx_spb_metrics_goal_id ON public.spb_metrics(goal_id);
CREATE INDEX idx_spb_districts_slug ON public.spb_districts(slug);

-- Insert sample district data
INSERT INTO public.spb_districts (name, slug, primary_color, secondary_color, is_public, admin_email) VALUES
('Omaha', 'omaha', '#51d01b', '#0099CC', true, 'admin@omaha.edu'),
('Lincoln', 'lincoln', '#CC0099', '#00CC99', true, 'admin@lincoln.edu'),
('Norfolk', 'norfolk', '#9900CC', '#CC9900', true, 'admin@norfolk.edu');

-- Verify the setup
SELECT 'SPB tables created successfully! Tables and policies are ready.' as message;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'spb_%';