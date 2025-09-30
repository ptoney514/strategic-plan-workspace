-- Disable RLS for development mode (service role key bypasses RLS anyway)
-- WARNING: Only use in development! Enable proper RLS for production!

-- Disable RLS on all tables for simplified development
ALTER TABLE spb_districts DISABLE ROW LEVEL SECURITY;
ALTER TABLE spb_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE spb_metrics DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies to clean up
DROP POLICY IF EXISTS "Enable all access for development" ON spb_districts;
DROP POLICY IF EXISTS "Enable all access for development" ON spb_goals;
DROP POLICY IF EXISTS "Enable all access for development" ON spb_metrics;

-- Grant full permissions to anon and authenticated roles
GRANT ALL ON spb_districts TO anon, authenticated;
GRANT ALL ON spb_goals TO anon, authenticated;
GRANT ALL ON spb_metrics TO anon, authenticated;

-- Grant usage on sequences for auto-increment IDs
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'RLS disabled for development mode. Service role key will bypass all security checks.' as message;