# Supabase Row Level Security Setup

## 🚨 CRITICAL: RLS Configuration Required

Your application is getting RLS errors because Row Level Security policies are not properly configured. You must manually configure these in Supabase Dashboard.

## Step-by-Step Setup

### 1. Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `qsftokjevxueboldvmzc` 
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### 2. Execute This SQL Code

**Copy and paste this ENTIRE block** into the SQL Editor and click **"Run"**:

```sql
-- Enable RLS on all tables (if not already enabled)
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Enable all access for development" ON districts;
DROP POLICY IF EXISTS "Enable all access for development" ON goals;
DROP POLICY IF EXISTS "Enable all access for development" ON metrics;
DROP POLICY IF EXISTS "Allow anon access" ON districts;
DROP POLICY IF EXISTS "Allow anon access" ON goals;
DROP POLICY IF EXISTS "Allow anon access" ON metrics;

-- Create permissive policies for development (allows all operations)
CREATE POLICY "Enable all access for development" 
ON districts FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all access for development" 
ON goals FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all access for development" 
ON metrics FOR ALL 
USING (true) 
WITH CHECK (true);

-- Grant necessary permissions to anon role (your app uses anon key)
GRANT ALL ON districts TO anon;
GRANT ALL ON goals TO anon;
GRANT ALL ON metrics TO anon;

-- Grant sequence usage for auto-increment IDs
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Verify the setup
SELECT 'RLS policies configured successfully!' as message;
```

### 3. Alternative: Disable RLS Temporarily

If the above doesn't work, you can temporarily disable RLS entirely:

```sql
-- TEMPORARY: Disable RLS for development
ALTER TABLE districts DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE metrics DISABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled temporarily - remember to re-enable for production!' as message;
```

⚠️ **Warning**: This disables all security. Only use for development!

## 4. Test the Fix

After running the SQL:

1. Go back to your application at `http://localhost:3000/dashboard/omaha`
2. Try clicking **"Add Strategic Objective"**
3. The RLS error should be gone!

## What This Does

- **RLS Policies**: Allows the `anon` role (your app) to read/write all data
- **Permissions**: Grants necessary database permissions
- **Development Mode**: Removes security restrictions for easier development

## For Production

⚠️ **IMPORTANT**: Before going to production, you MUST:

1. Remove these permissive policies
2. Implement proper authentication
3. Create restrictive RLS policies based on user roles
4. Never use these open policies in production!

## Troubleshooting

### Still getting RLS errors?
- Make sure you ran the ENTIRE SQL block
- Check that all tables have the policies applied
- Try the "disable RLS" approach as a last resort

### SQL execution errors?
- Make sure you're in the correct Supabase project
- Check that the tables exist (districts, goals, metrics)
- Contact support if tables are missing

---

**Need help?** The SQL must be run in Supabase Dashboard - the automated script approach doesn't work due to API limitations.