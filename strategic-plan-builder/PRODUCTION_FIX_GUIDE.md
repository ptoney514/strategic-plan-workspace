# Production Database Fix Guide

## Problem Summary
The production Supabase database (qsftokjevxueboldvmzc.supabase.co) is missing critical columns and constraints that exist in the local development environment, causing 500 errors when creating or updating metrics.

## Missing Elements in Production
1. **Missing Columns:**
   - `display_width` (for UI layout control)
   - `description` (for metric descriptions)
   - `visualization_type` and `visualization_config` (for chart rendering)
   - Multiple tracking and metadata columns
   - Survey-specific columns

2. **Missing/Incorrect Constraints:**
   - `metric_type` doesn't include 'survey' option
   - `display_width` constraint may be incorrect or missing
   - Other enum constraints for new columns

## Step-by-Step Fix Instructions

### Step 1: Backup Production Data (CRITICAL)
Before making any changes, export your production data:

1. Go to https://supabase.com/dashboard/project/qsftokjevxueboldvmzc
2. Navigate to Settings → Database
3. Click "Backups" and create a manual backup
4. Wait for backup completion before proceeding

### Step 2: Verify Current Schema
Run the verification script to understand the current state:

1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste contents of `/migrations/verify_production_schema.sql`
3. Run the script and save the output for reference
4. Review which columns are missing

### Step 3: Apply the Fix Migration
Apply the comprehensive fix to add missing columns and constraints:

1. In SQL Editor, copy and paste contents of `/migrations/production_fix_metrics_schema.sql`
2. Review the script - it's wrapped in a transaction for safety
3. Execute the script
4. Check for any errors in the output
5. The script will show verification results at the end

### Step 4: Verify Environment Variables on Vercel
Ensure Vercel has the correct production Supabase credentials:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Verify these are set for Production environment:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://qsftokjevxueboldvmzc.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 5: Redeploy on Vercel
After database fixes are applied:

1. Trigger a redeployment on Vercel
2. This ensures the application picks up any environment changes
3. Monitor the deployment logs for any errors

### Step 6: Test the Fix
After deployment completes:

1. Navigate to your production site
2. Try creating a new metric
3. Try updating an existing metric
4. Verify the display_width field updates correctly
5. Check that visualization settings save properly

## Rollback Plan (If Needed)
If issues occur, you can rollback:

```sql
-- Emergency rollback (use with caution)
BEGIN;

-- Remove added columns (adjust as needed)
ALTER TABLE public.spb_metrics 
DROP COLUMN IF EXISTS display_width CASCADE,
DROP COLUMN IF EXISTS description CASCADE,
DROP COLUMN IF EXISTS visualization_type CASCADE,
DROP COLUMN IF EXISTS visualization_config CASCADE;

-- Restore original metric_type constraint
ALTER TABLE public.spb_metrics 
DROP CONSTRAINT IF EXISTS spb_metrics_metric_type_check;

ALTER TABLE public.spb_metrics 
ADD CONSTRAINT spb_metrics_metric_type_check 
CHECK (metric_type IN ('percent', 'number', 'rating', 'currency', 'status', 'narrative', 'link'));

COMMIT;
```

## Important Files
- **Fix Script**: `/migrations/production_fix_metrics_schema.sql`
- **Verification Script**: `/migrations/verify_production_schema.sql`
- **API Route**: `/app/api/districts/[slug]/metrics/route.ts`

## Expected Outcome
After applying the fix:
- All metric CRUD operations should work without 500 errors
- Display width field should update correctly
- Visualization settings should persist
- Survey metrics should be supported
- No data loss should occur (script only adds, doesn't remove)

## Support
If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → API
2. Check Vercel function logs: Vercel Dashboard → Functions
3. Use the verification script to confirm schema state
4. Restore from backup if critical issues occur

## Migration Safety Features
The production fix script includes:
- Transaction wrapping (all-or-nothing execution)
- IF NOT EXISTS clauses (prevents duplicate column errors)
- Safe constraint dropping and recreation
- Default values for new columns
- Data preservation (no destructive operations)
- Verification steps at the end

## Post-Migration Checklist
- [ ] Backup created before migration
- [ ] Verification script run and output saved
- [ ] Migration script executed successfully
- [ ] No errors in migration output
- [ ] Vercel environment variables verified
- [ ] Application redeployed
- [ ] Create metric tested
- [ ] Update metric tested
- [ ] Display width updates correctly
- [ ] Visualization settings persist