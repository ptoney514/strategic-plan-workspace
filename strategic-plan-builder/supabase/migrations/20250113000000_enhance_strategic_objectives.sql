-- Migration: Enhance Strategic Objectives Data Model
-- Description: Adds comprehensive fields for better strategic planning capabilities
-- Date: 2025-01-13

-- =====================================================
-- PHASE 1: Core Field Extensions to spb_goals table
-- =====================================================

-- Add ownership and organizational fields
ALTER TABLE public.spb_goals 
ADD COLUMN IF NOT EXISTS owner_id UUID,
ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS department VARCHAR(255),
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) CHECK (priority IN ('critical', 'high', 'medium', 'low', NULL)),
ADD COLUMN IF NOT EXISTS status_detail VARCHAR(20) CHECK (status_detail IN ('not_started', 'planning', 'in_progress', 'completed', 'on_hold', NULL));

-- Add timeline fields
ALTER TABLE public.spb_goals
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS review_frequency VARCHAR(20) CHECK (review_frequency IN ('weekly', 'monthly', 'quarterly', 'annually', NULL)),
ADD COLUMN IF NOT EXISTS last_reviewed TIMESTAMP WITH TIME ZONE;

-- Add budget and strategic alignment
ALTER TABLE public.spb_goals
ADD COLUMN IF NOT EXISTS budget_allocated DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS budget_spent DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS strategic_theme_id UUID;

-- Add visibility and communication fields
ALTER TABLE public.spb_goals
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS executive_summary TEXT;

-- =====================================================
-- PHASE 2: Enhance spb_metrics table
-- =====================================================

ALTER TABLE public.spb_metrics
ADD COLUMN IF NOT EXISTS baseline_value DECIMAL,
ADD COLUMN IF NOT EXISTS milestone_dates JSONB,
ADD COLUMN IF NOT EXISTS trend_direction VARCHAR(20) CHECK (trend_direction IN ('improving', 'stable', 'declining', NULL)),
ADD COLUMN IF NOT EXISTS collection_frequency VARCHAR(50),
ADD COLUMN IF NOT EXISTS data_source_details TEXT,
ADD COLUMN IF NOT EXISTS last_collected DATE;

-- =====================================================
-- PHASE 3: Create Supporting Tables
-- =====================================================

-- Strategic themes/pillars table
CREATE TABLE IF NOT EXISTS public.spb_strategic_themes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    district_id UUID NOT NULL REFERENCES public.spb_districts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#0099CC',
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goal dependencies table
CREATE TABLE IF NOT EXISTS public.spb_goal_dependencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES public.spb_goals(id) ON DELETE CASCADE,
    depends_on_goal_id UUID NOT NULL REFERENCES public.spb_goals(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) CHECK (dependency_type IN ('blocks', 'requires', 'relates_to', 'supports')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(goal_id, depends_on_goal_id)
);

-- Action items/initiatives table
CREATE TABLE IF NOT EXISTS public.spb_initiatives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES public.spb_goals(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked', 'cancelled')),
    priority VARCHAR(20) CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    owner_name VARCHAR(255),
    owner_id UUID,
    due_date DATE,
    completed_date DATE,
    percent_complete INTEGER DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evidence/artifacts table
CREATE TABLE IF NOT EXISTS public.spb_goal_artifacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES public.spb_goals(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    artifact_type VARCHAR(50) CHECK (artifact_type IN ('document', 'image', 'spreadsheet', 'presentation', 'link', 'other')),
    uploaded_by VARCHAR(255),
    uploaded_by_id UUID,
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress updates/notes table
CREATE TABLE IF NOT EXISTS public.spb_goal_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES public.spb_goals(id) ON DELETE CASCADE,
    update_text TEXT NOT NULL,
    update_type VARCHAR(20) CHECK (update_type IN ('progress', 'risk', 'milestone', 'general', 'blocker')),
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    created_by VARCHAR(255),
    created_by_id UUID,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stakeholders table
CREATE TABLE IF NOT EXISTS public.spb_goal_stakeholders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES public.spb_goals(id) ON DELETE CASCADE,
    stakeholder_name VARCHAR(255) NOT NULL,
    stakeholder_email VARCHAR(255),
    stakeholder_role VARCHAR(50) CHECK (stakeholder_role IN ('sponsor', 'owner', 'contributor', 'reviewer', 'informed')),
    organization VARCHAR(255),
    notes TEXT,
    notify_on_updates BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(goal_id, stakeholder_email)
);

-- Milestones table
CREATE TABLE IF NOT EXISTS public.spb_goal_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES public.spb_goals(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    completed_date DATE,
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'missed')),
    success_criteria TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PHASE 4: Create Indexes for Performance
-- =====================================================

-- Indexes for spb_goals extended fields
CREATE INDEX IF NOT EXISTS idx_goals_owner_id ON public.spb_goals(owner_id);
CREATE INDEX IF NOT EXISTS idx_goals_department ON public.spb_goals(department);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON public.spb_goals(priority);
CREATE INDEX IF NOT EXISTS idx_goals_status_detail ON public.spb_goals(status_detail);
CREATE INDEX IF NOT EXISTS idx_goals_start_date ON public.spb_goals(start_date);
CREATE INDEX IF NOT EXISTS idx_goals_end_date ON public.spb_goals(end_date);
CREATE INDEX IF NOT EXISTS idx_goals_strategic_theme ON public.spb_goals(strategic_theme_id);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_themes_district ON public.spb_strategic_themes(district_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_goal ON public.spb_goal_dependencies(goal_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_depends_on ON public.spb_goal_dependencies(depends_on_goal_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_goal ON public.spb_initiatives(goal_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_status ON public.spb_initiatives(status);
CREATE INDEX IF NOT EXISTS idx_initiatives_due_date ON public.spb_initiatives(due_date);
CREATE INDEX IF NOT EXISTS idx_artifacts_goal ON public.spb_goal_artifacts(goal_id);
CREATE INDEX IF NOT EXISTS idx_updates_goal ON public.spb_goal_updates(goal_id);
CREATE INDEX IF NOT EXISTS idx_updates_created_at ON public.spb_goal_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stakeholders_goal ON public.spb_goal_stakeholders(goal_id);
CREATE INDEX IF NOT EXISTS idx_milestones_goal ON public.spb_goal_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_milestones_target_date ON public.spb_goal_milestones(target_date);

-- =====================================================
-- PHASE 5: Add Foreign Key Constraint for Theme
-- =====================================================

ALTER TABLE public.spb_goals
ADD CONSTRAINT fk_goal_strategic_theme 
FOREIGN KEY (strategic_theme_id) 
REFERENCES public.spb_strategic_themes(id) 
ON DELETE SET NULL;

-- =====================================================
-- PHASE 6: Enable RLS on New Tables
-- =====================================================

ALTER TABLE public.spb_strategic_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_goal_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_goal_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_goal_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_goal_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_goal_milestones ENABLE ROW LEVEL SECURITY;

-- Create development policies (permissive for now, to be updated for production)
CREATE POLICY "Enable all access for development" ON public.spb_strategic_themes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON public.spb_goal_dependencies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON public.spb_initiatives FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON public.spb_goal_artifacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON public.spb_goal_updates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON public.spb_goal_stakeholders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for development" ON public.spb_goal_milestones FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions to anon role
GRANT ALL ON public.spb_strategic_themes TO anon;
GRANT ALL ON public.spb_goal_dependencies TO anon;
GRANT ALL ON public.spb_initiatives TO anon;
GRANT ALL ON public.spb_goal_artifacts TO anon;
GRANT ALL ON public.spb_goal_updates TO anon;
GRANT ALL ON public.spb_goal_stakeholders TO anon;
GRANT ALL ON public.spb_goal_milestones TO anon;

-- =====================================================
-- PHASE 7: Add Update Triggers for Timestamps
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for tables with updated_at
CREATE TRIGGER update_spb_strategic_themes_updated_at BEFORE UPDATE ON public.spb_strategic_themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spb_initiatives_updated_at BEFORE UPDATE ON public.spb_initiatives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spb_goal_milestones_updated_at BEFORE UPDATE ON public.spb_goal_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PHASE 8: Add Comments for Documentation
-- =====================================================

COMMENT ON TABLE public.spb_strategic_themes IS 'Strategic themes or pillars that goals can be aligned with';
COMMENT ON TABLE public.spb_goal_dependencies IS 'Tracks dependencies and relationships between goals';
COMMENT ON TABLE public.spb_initiatives IS 'Action items and initiatives associated with goals';
COMMENT ON TABLE public.spb_goal_artifacts IS 'Evidence, documents, and artifacts supporting goal progress';
COMMENT ON TABLE public.spb_goal_updates IS 'Progress updates and notes for goals';
COMMENT ON TABLE public.spb_goal_stakeholders IS 'Stakeholders associated with specific goals';
COMMENT ON TABLE public.spb_goal_milestones IS 'Key milestones and checkpoints for goal achievement';

COMMENT ON COLUMN public.spb_goals.owner_id IS 'UUID of the person responsible for this goal';
COMMENT ON COLUMN public.spb_goals.owner_name IS 'Display name of the goal owner';
COMMENT ON COLUMN public.spb_goals.department IS 'Department or division responsible for this goal';
COMMENT ON COLUMN public.spb_goals.priority IS 'Priority level of the goal';
COMMENT ON COLUMN public.spb_goals.status_detail IS 'Detailed status of goal progress';
COMMENT ON COLUMN public.spb_goals.strategic_theme_id IS 'Links goal to a strategic theme or pillar';
COMMENT ON COLUMN public.spb_goals.budget_allocated IS 'Budget allocated for achieving this goal';
COMMENT ON COLUMN public.spb_goals.budget_spent IS 'Budget spent so far on this goal';
COMMENT ON COLUMN public.spb_goals.executive_summary IS 'Brief summary for executive reporting';

-- Migration complete message
DO $$
BEGIN
    RAISE NOTICE 'Strategic Objectives Enhancement Migration completed successfully!';
END $$;