# Environment Setup Guide

## Three-Tier Environment Strategy

### 1. Local Development (Current)
- **Database**: Local Supabase (`supabase start`)
- **URL**: http://127.0.0.1:54321
- **Config**: `.env.local`
- **Purpose**: Active development & testing

### 2. Staging Environment
- **Project**: scpluslhcastrobigkfb
- **URL**: https://scpluslhcastrobigkfb.supabase.co
- **Config**: `.env.staging`
- **Purpose**: Pre-production testing with test data
- **Deployment**: Vercel Preview branches

### 3. Production Environment
- **Project**: recipes (qsftokjevxueboldvmzc)
- **URL**: https://qsftokjevxueboldvmzc.supabase.co
- **Config**: `.env.production`
- **Purpose**: Live application with real data
- **Deployment**: Vercel main branch

## Setup Instructions

### Step 1: Configure Staging Environment

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/scpluslhcastrobigkfb/settings/api)
2. Copy the following values:
   - Project URL
   - Anon/Public Key
   - Service Role Key (under "Service role - secret")
3. Update `.env.staging` with these values

### Step 2: Apply Migrations to Staging

```bash
# Link to staging project
supabase link --project-ref scpluslhcastrobigkfb

# Push migrations to staging
supabase db push

# Optional: Seed with test data
supabase db seed
```

### Step 3: Test Staging Locally

```bash
# Use staging environment variables
cp .env.staging .env.local

# Start development server
npm run dev

# Verify connection to staging database
```

### Step 4: Deploy to Vercel

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy to preview (staging)
vercel --env-file=.env.staging

# Deploy to production
vercel --prod --env-file=.env.production
```

## Environment Variables Reference

### Required Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (admin access)

### Optional Variables
- `DATABASE_URL`: Direct PostgreSQL connection string

## Migration Workflow

1. **Develop locally**: Create/test migrations with local Supabase
2. **Test on staging**: Push migrations to staging, test with sample data
3. **Deploy to production**: After staging validation, apply to production

## Data Management

### Local Development
- Use seed data from `supabase/seed.sql`
- Reset anytime with `supabase db reset`

### Staging
- Maintain realistic test data
- Regular refresh from production structure (not data)
- Test data migrations here first

### Production
- Real user data
- Always backup before migrations
- Use Supabase's point-in-time recovery

## Best Practices

1. **Never use production data locally**
2. **Test all migrations on staging first**
3. **Keep staging data realistic but anonymous**
4. **Use environment-specific API keys**
5. **Rotate keys regularly**
6. **Monitor staging for performance testing**

## Troubleshooting

### Connection Issues
```bash
# Verify Supabase status
supabase status

# Check environment variables
env | grep SUPABASE

# Test connection
npx supabase db test
```

### Migration Conflicts
```bash
# Reset staging database
supabase db reset --linked

# Re-apply migrations
supabase db push
```

## Security Notes

- Keep `.env.staging` and `.env.production` out of version control
- Use Vercel's environment variables for deployment
- Rotate service role keys quarterly
- Enable RLS policies before production