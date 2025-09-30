# Fix for Production Metric Saving Error (500 Error on Vercel)

## Problem
The application is getting a 500 error when trying to save metrics in production (Vercel deployment). The error occurs because:
- Production uses the `anon` key which respects Row Level Security (RLS)
- The database tables have RLS enabled but no policies configured
- Without policies, all operations are denied by default

## Solution
Run the RLS policies SQL script on your production Supabase database.

### Steps to Fix:

1. **Go to your Supabase Dashboard**
   - Navigate to your production project at https://app.supabase.com

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run the RLS Policy Script**
   - Copy the entire contents of `supabase/production-rls-policies.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

4. **Verify the Fix**
   - The SQL script includes a verification query at the end
   - You should see policies listed for all three tables: `spb_districts`, `spb_goals`, `spb_metrics`
   - Each table should have a policy named "Enable public access for MVP"

5. **Test in Production**
   - Go back to your Vercel deployment
   - Try adding or editing a metric
   - It should now save successfully

## Important Notes

⚠️ **Security Warning**: The current RLS policies allow public read/write access. This is acceptable for the MVP/demo phase but should be replaced with proper authentication-based policies before full production release.

## Alternative: Environment Variable Solution

If you prefer not to use RLS in production (less secure but simpler), you can:

1. Add the `SUPABASE_SERVICE_ROLE_KEY` to your Vercel environment variables
2. This will bypass RLS entirely (not recommended for production with real users)

## Troubleshooting

If the error persists after applying the RLS policies:

1. **Check Vercel Logs**
   - Go to your Vercel dashboard
   - Check the function logs for more detailed error messages

2. **Verify Environment Variables**
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` is set correctly
   - Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly

3. **Clear Vercel Cache**
   - Redeploy the application to ensure all changes take effect

## Related Files
- `supabase/production-rls-policies.sql` - The RLS policies to apply
- `lib/supabase-server.ts` - Server-side Supabase client configuration
- `app/api/districts/[slug]/metrics/route.ts` - API route handling metric operations