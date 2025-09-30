-- Migration: Refactor database from 2-level to 3+ level hierarchy
-- From: District -> Goals -> Strategies  
-- To: District -> Strategic Objectives -> Goals -> Sub-goals (with metrics at all levels)

BEGIN;

-- Add new columns to districts table
ALTER TABLE districts 
ADD COLUMN IF NOT EXISTS admin_email TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Add new columns to goals table for hierarchy
ALTER TABLE goals
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES goals(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS goal_number TEXT NOT NULL DEFAULT '1',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 0;

-- Create index on parent_id for faster hierarchy queries
CREATE INDEX IF NOT EXISTS idx_goals_parent_id ON goals(parent_id);
CREATE INDEX IF NOT EXISTS idx_goals_level ON goals(level);
CREATE INDEX IF NOT EXISTS idx_goals_goal_number ON goals(goal_number);

-- Rename strategies table to metrics
ALTER TABLE strategies RENAME TO metrics;

-- Update metrics table structure
ALTER TABLE metrics
RENAME COLUMN title TO name;

-- Add new columns to metrics table
ALTER TABLE metrics
ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT '%',
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('on-target', 'near-target', 'off-target'));

-- Update metric_type to use new enum values
ALTER TABLE metrics
ALTER COLUMN metric_type TYPE TEXT,
ADD CONSTRAINT check_metric_type CHECK (metric_type IN ('percent', 'number', 'rating', 'currency', 'status'));

-- Migrate existing data:
-- 1. Set all existing goals to level 0 (Strategic Objectives) with sequential goal numbers
UPDATE goals 
SET level = 0, 
    goal_number = row_number() OVER (PARTITION BY district_id ORDER BY order_position, created_at)::text
WHERE level IS NULL OR level = 0;

-- 2. Update existing metrics to have proper units based on metric_type
UPDATE metrics 
SET unit = CASE 
    WHEN metric_type = 'percent' THEN '%'
    WHEN metric_type = 'number' THEN '#'
    WHEN metric_type = 'rating' THEN ' out of 5'
    WHEN metric_type = 'currency' THEN '$'
    ELSE '%'
END
WHERE unit IS NULL OR unit = '';

-- 3. Set default status for metrics based on progress toward target
UPDATE metrics 
SET status = CASE 
    WHEN current_value >= target_value * 0.95 THEN 'on-target'
    WHEN current_value >= target_value * 0.8 THEN 'near-target'
    ELSE 'off-target'
END
WHERE status IS NULL;

-- Add constraints after data migration
ALTER TABLE goals 
ALTER COLUMN goal_number SET NOT NULL,
ALTER COLUMN level SET NOT NULL;

ALTER TABLE metrics
ALTER COLUMN unit SET NOT NULL;

COMMIT;