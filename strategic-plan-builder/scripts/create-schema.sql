-- Create strategic_plan_builder schema and migrate tables
-- Run this in Supabase Dashboard SQL Editor

-- Create the new schema
CREATE SCHEMA IF NOT EXISTS strategic_plan_builder;

-- Grant usage on schema to both anon and authenticated roles
GRANT USAGE ON SCHEMA strategic_plan_builder TO anon, authenticated;

-- Create districts table in new schema
CREATE TABLE strategic_plan_builder.districts (
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

-- Create goals table in new schema
CREATE TABLE strategic_plan_builder.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    district_id UUID NOT NULL REFERENCES strategic_plan_builder.districts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES strategic_plan_builder.goals(id) ON DELETE CASCADE,
    goal_number VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    level INTEGER DEFAULT 0,
    order_position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create metrics table in new schema
CREATE TABLE strategic_plan_builder.metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES strategic_plan_builder.goals(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT,
    metric_type VARCHAR CHECK (metric_type IN ('percentage', 'count', 'currency', 'decimal')) DEFAULT 'percentage',
    data_source_type VARCHAR CHECK (data_source_type IN ('manual', 'api', 'csv')) DEFAULT 'manual',
    target_value DECIMAL,
    current_value DECIMAL DEFAULT 0,
    unit VARCHAR,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE strategic_plan_builder.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_plan_builder.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_plan_builder.metrics ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies (in case of re-run)
DROP POLICY IF EXISTS "Enable all access for development" ON strategic_plan_builder.districts;
DROP POLICY IF EXISTS "Enable all access for development" ON strategic_plan_builder.goals;
DROP POLICY IF EXISTS "Enable all access for development" ON strategic_plan_builder.metrics;

-- Create permissive policies for development (allows all operations)
CREATE POLICY "Enable all access for development" 
ON strategic_plan_builder.districts FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all access for development" 
ON strategic_plan_builder.goals FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all access for development" 
ON strategic_plan_builder.metrics FOR ALL 
USING (true) 
WITH CHECK (true);

-- Grant comprehensive permissions to anon and authenticated roles
GRANT ALL ON strategic_plan_builder.districts TO anon, authenticated;
GRANT ALL ON strategic_plan_builder.goals TO anon, authenticated;
GRANT ALL ON strategic_plan_builder.metrics TO anon, authenticated;

-- Grant sequence usage for auto-increment IDs
GRANT USAGE ON ALL SEQUENCES IN SCHEMA strategic_plan_builder TO anon, authenticated;

-- Create indexes for better performance
CREATE INDEX idx_goals_district_id ON strategic_plan_builder.goals(district_id);
CREATE INDEX idx_goals_parent_id ON strategic_plan_builder.goals(parent_id);
CREATE INDEX idx_metrics_goal_id ON strategic_plan_builder.metrics(goal_id);
CREATE INDEX idx_districts_slug ON strategic_plan_builder.districts(slug);

-- Insert the existing district data (you can modify this based on your needs)
INSERT INTO strategic_plan_builder.districts (name, slug, primary_color, secondary_color, is_public) VALUES
('Omaha', 'omaha', '#51d01b', '#0099CC', true),
('Lincoln', 'lincoln', '#CC0099', '#00CC99', true),
('Norfolk', 'norfolk', '#9900CC', '#CC9900', true);

-- Verify the setup
SELECT 'Schema created successfully! Tables and policies are ready.' as message;
SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'strategic_plan_builder';