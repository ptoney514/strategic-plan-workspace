-- Production RLS Policies for Strategic Plan Builder
-- This enables public read/write access for the MVP phase
-- TODO: Replace with proper authentication-based policies before full production release

-- Ensure RLS is enabled on all tables
ALTER TABLE spb_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE spb_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE spb_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable public access for MVP" ON spb_districts;
DROP POLICY IF EXISTS "Enable public access for MVP" ON spb_goals;
DROP POLICY IF EXISTS "Enable public access for MVP" ON spb_metrics;

-- Districts table - allow all operations for MVP
CREATE POLICY "Enable public access for MVP" 
ON spb_districts 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Goals table - allow all operations for MVP
CREATE POLICY "Enable public access for MVP" 
ON spb_goals 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Metrics table - allow all operations for MVP
CREATE POLICY "Enable public access for MVP" 
ON spb_metrics 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Grant necessary permissions to anon role (used by the anon key in production)
GRANT ALL ON spb_districts TO anon;
GRANT ALL ON spb_goals TO anon;
GRANT ALL ON spb_metrics TO anon;

-- Grant usage on sequences for auto-increment IDs
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Verify policies are in place
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('spb_districts', 'spb_goals', 'spb_metrics')
ORDER BY tablename, policyname;