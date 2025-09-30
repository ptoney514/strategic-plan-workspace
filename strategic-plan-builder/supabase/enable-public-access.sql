-- Enable public read/write access for development
-- WARNING: This should only be used for development. Implement proper authentication for production!

-- Drop existing RLS policies if they exist (both old and new table names)
DROP POLICY IF EXISTS "Enable all access for development" ON districts;
DROP POLICY IF EXISTS "Enable all access for development" ON goals;
DROP POLICY IF EXISTS "Enable all access for development" ON metrics;
DROP POLICY IF EXISTS "Enable all access for development" ON sp_users;
DROP POLICY IF EXISTS "Enable all access for development" ON spb_districts;
DROP POLICY IF EXISTS "Enable all access for development" ON spb_goals;
DROP POLICY IF EXISTS "Enable all access for development" ON spb_metrics;

-- Create permissive policies for all tables (using correct spb_ prefixed table names)

-- Districts table - allow all operations
CREATE POLICY "Enable all access for development" 
ON spb_districts 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Goals table - allow all operations
CREATE POLICY "Enable all access for development" 
ON spb_goals 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Metrics table - allow all operations
CREATE POLICY "Enable all access for development" 
ON spb_metrics 
FOR ALL 
USING (true)
WITH CHECK (true);

-- SP Users table - allow all operations (if it exists)
CREATE POLICY "Enable all access for development" 
ON sp_users 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Verify RLS is still enabled (required for policies to work)
ALTER TABLE spb_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE spb_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE spb_metrics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sp_users ENABLE ROW LEVEL SECURITY; -- Only if table exists

-- Grant necessary permissions to anon role (used by your anon key)
GRANT ALL ON spb_districts TO anon;
GRANT ALL ON spb_goals TO anon;
GRANT ALL ON spb_metrics TO anon;
-- GRANT ALL ON sp_users TO anon; -- Only if table exists

-- Grant usage on sequences (for auto-increment IDs if any)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Success message
SELECT 'Public access enabled for development. Remember to implement proper authentication before production!' as message;