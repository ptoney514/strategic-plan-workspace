-- COMPLETE DATABASE RESET SCRIPT
-- This script will completely clean up all tables and recreate fresh spb_ tables
-- Run this in Supabase Dashboard SQL Editor

-- ============================================
-- STEP 1: Drop ALL existing tables completely
-- ============================================

-- Drop old tables if they exist (with CASCADE to handle dependencies)
DROP TABLE IF EXISTS public.metrics CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.districts CASCADE;

-- Drop new tables if they exist (with CASCADE to handle dependencies) 
DROP TABLE IF EXISTS public.spb_metrics CASCADE;
DROP TABLE IF EXISTS public.spb_goals CASCADE;
DROP TABLE IF EXISTS public.spb_districts CASCADE;

-- Drop old schema and everything in it
DROP SCHEMA IF EXISTS strategic_plan_builder CASCADE;

-- ============================================
-- STEP 2: Create fresh spb_ tables in public schema
-- ============================================

-- Create spb_districts table
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

-- Create spb_goals table
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

-- Create spb_metrics table
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

-- ============================================
-- STEP 3: Set up Row Level Security (RLS)
-- ============================================

-- Enable Row Level Security on all tables
ALTER TABLE public.spb_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_metrics ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first (cleanup)
DROP POLICY IF EXISTS "Enable all access for development" ON public.spb_districts;
DROP POLICY IF EXISTS "Enable all access for development" ON public.spb_goals;
DROP POLICY IF EXISTS "Enable all access for development" ON public.spb_metrics;

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

-- ============================================
-- STEP 4: Grant permissions
-- ============================================

-- Grant comprehensive permissions to anon and authenticated roles
GRANT ALL ON public.spb_districts TO anon, authenticated;
GRANT ALL ON public.spb_goals TO anon, authenticated;
GRANT ALL ON public.spb_metrics TO anon, authenticated;

-- Grant sequence usage for auto-increment IDs
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- STEP 5: Create performance indexes
-- ============================================

-- Create indexes for better performance
CREATE INDEX idx_spb_goals_district_id ON public.spb_goals(district_id);
CREATE INDEX idx_spb_goals_parent_id ON public.spb_goals(parent_id);
CREATE INDEX idx_spb_metrics_goal_id ON public.spb_metrics(goal_id);
CREATE INDEX idx_spb_districts_slug ON public.spb_districts(slug);

-- ============================================
-- STEP 6: Insert fresh sample data
-- ============================================

-- Insert sample district data (fresh UUIDs will be generated)
INSERT INTO public.spb_districts (name, slug, primary_color, secondary_color, is_public, admin_email) VALUES
('Omaha', 'omaha', '#51d01b', '#0099CC', true, 'admin@omaha.edu'),
('Lincoln', 'lincoln', '#CC0099', '#00CC99', true, 'admin@lincoln.edu'),
('Norfolk', 'norfolk', '#9900CC', '#CC9900', true, 'admin@norfolk.edu');

-- ============================================
-- STEP 7: Verification
-- ============================================

-- Verify the setup
SELECT 'DATABASE RESET COMPLETE! ✅' as status;
SELECT 'New SPB tables created and configured:' as message;
SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'spb_%';
SELECT 'Sample districts inserted:' as message;
SELECT id, name, slug FROM public.spb_districts ORDER BY name;