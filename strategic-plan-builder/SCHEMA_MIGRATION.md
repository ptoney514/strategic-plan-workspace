# Strategic Plan Builder Schema Migration

## Overview

We have migrated from using the `public` schema to a dedicated `strategic_plan_builder` schema to:
- Resolve phantom data and RLS policy conflicts
- Provide proper database isolation
- Enable clean architecture with dedicated schema
- Avoid mixing with Supabase system tables

## Database Schema Setup

### Step 1: Create the Schema in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `qsftokjevxueboldvmzc`
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. Copy and paste the contents of `scripts/create-schema.sql` and run it

This will:
- Create the `strategic_plan_builder` schema
- Create all tables (districts, goals, metrics) with proper structure
- Set up Row Level Security policies for development
- Grant necessary permissions
- Insert basic district data

### Step 2: Verify Setup

After running the SQL, you should see:
- New schema `strategic_plan_builder` in your database
- Three tables: `districts`, `goals`, `metrics`
- Proper RLS policies configured
- Three sample districts created

## Code Changes Made

### 1. Supabase Client Configuration
Updated `/lib/supabase.ts` to use the new schema:
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // ... other config
  db: {
    schema: 'strategic_plan_builder'
  }
});
```

### 2. Database Scripts Updated
- `scripts/cleanup-database.js` - Now uses new schema
- `scripts/setup-supabase-rls.js` - Updated for new schema tables

### 3. API Routes
All API routes remain unchanged because the schema is configured at the client level. The application will automatically use the new schema for all database operations.

## Benefits of This Migration

✅ **Clean Start**: No more phantom data or RLS conflicts
✅ **Proper Isolation**: Your app tables are separate from system tables  
✅ **Better Organization**: Professional database structure
✅ **Future Proof**: Easier to manage permissions and backups
✅ **Consistent Access**: Both anon and service roles see the same data

## Verification Steps

1. **Test API Connection**: Visit `http://localhost:3000/api/districts`
2. **Test District Page**: Visit `http://localhost:3000/dashboard/omaha`
3. **Add Strategic Objective**: Click "Add Strategic Objective" and verify it works
4. **Edit Goals**: Try editing existing goals and adding metrics

## Troubleshooting

### If you get "schema does not exist" errors:
1. Ensure you ran the SQL from `scripts/create-schema.sql` in Supabase Dashboard
2. Verify the schema was created: `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'strategic_plan_builder';`

### If you get RLS policy errors:
1. Run the RLS setup script: `node scripts/setup-supabase-rls.js`
2. Or manually apply the policies from the SQL file

### If data is missing:
1. Check that the district data was inserted properly
2. Verify you're looking in the right schema in Supabase Dashboard

## Rollback Plan

If you need to rollback to the public schema:
1. Remove the `db: { schema: 'strategic_plan_builder' }` configuration from `/lib/supabase.ts`
2. Update script files to remove schema references
3. The application will use the public schema tables again

## Production Considerations

⚠️ **Important**: Before going to production:
1. Replace development RLS policies with restrictive ones
2. Implement proper user authentication
3. Create role-based access controls
4. Never use these permissive policies in production!