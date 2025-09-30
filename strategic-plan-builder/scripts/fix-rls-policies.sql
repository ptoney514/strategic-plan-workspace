-- Fix RLS Policies for SPB Tables
-- This script fixes the Row Level Security policies that are preventing goals from being read
-- Run this in Supabase Dashboard SQL Editor

-- ============================================
-- STEP 1: Drop all existing policies
-- ============================================
DROP POLICY IF EXISTS "Enable all access for development" ON public.spb_districts;
DROP POLICY IF EXISTS "Enable all access for development" ON public.spb_goals;
DROP POLICY IF EXISTS "Enable all access for development" ON public.spb_metrics;

-- ============================================
-- STEP 2: Temporarily disable RLS to test (optional - uncomment if needed)
-- ============================================
-- ALTER TABLE public.spb_districts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.spb_goals DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.spb_metrics DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Create explicit permissive policies for each operation
-- ============================================

-- Districts policies
CREATE POLICY "spb_districts_select_policy" 
ON public.spb_districts FOR SELECT 
USING (true);

CREATE POLICY "spb_districts_insert_policy" 
ON public.spb_districts FOR INSERT 
WITH CHECK (true);

CREATE POLICY "spb_districts_update_policy" 
ON public.spb_districts FOR UPDATE 
USING (true) WITH CHECK (true);

CREATE POLICY "spb_districts_delete_policy" 
ON public.spb_districts FOR DELETE 
USING (true);

-- Goals policies
CREATE POLICY "spb_goals_select_policy" 
ON public.spb_goals FOR SELECT 
USING (true);

CREATE POLICY "spb_goals_insert_policy" 
ON public.spb_goals FOR INSERT 
WITH CHECK (true);

CREATE POLICY "spb_goals_update_policy" 
ON public.spb_goals FOR UPDATE 
USING (true) WITH CHECK (true);

CREATE POLICY "spb_goals_delete_policy" 
ON public.spb_goals FOR DELETE 
USING (true);

-- Metrics policies
CREATE POLICY "spb_metrics_select_policy" 
ON public.spb_metrics FOR SELECT 
USING (true);

CREATE POLICY "spb_metrics_insert_policy" 
ON public.spb_metrics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "spb_metrics_update_policy" 
ON public.spb_metrics FOR UPDATE 
USING (true) WITH CHECK (true);

CREATE POLICY "spb_metrics_delete_policy" 
ON public.spb_metrics FOR DELETE 
USING (true);

-- ============================================
-- STEP 4: Ensure RLS is enabled (if we didn't disable it above)
-- ============================================
ALTER TABLE public.spb_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spb_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Re-grant permissions to ensure roles have access
-- ============================================
GRANT ALL ON public.spb_districts TO anon, authenticated;
GRANT ALL ON public.spb_goals TO anon, authenticated;
GRANT ALL ON public.spb_metrics TO anon, authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- STEP 6: Test the setup
-- ============================================
SELECT 'RLS policies updated successfully! ✅' as status;

-- Show all policies for verification
SELECT tablename, policyname, cmd, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename LIKE 'spb_%'
ORDER BY tablename, cmd;

-- Show table information
SELECT tablename, tableowner
FROM pg_tables 
WHERE schemaname = 'public' AND tablename LIKE 'spb_%';

SELECT 'Test: Counting goals in database...' as message;
SELECT COUNT(*) as total_goals FROM public.spb_goals;

SELECT 'Test: Listing all goals with their districts...' as message;
SELECT g.id, g.title, g.goal_number, g.district_id, d.name as district_name
FROM public.spb_goals g
LEFT JOIN public.spb_districts d ON g.district_id = d.id
ORDER BY d.name, g.goal_number;