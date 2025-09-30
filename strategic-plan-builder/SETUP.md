# Strategic Plan Builder - Setup Guide

This guide will help you set up the Strategic Plan Builder application with Supabase.

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Docker (optional, for local development)

## Quick Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd strategic-plan-builder
npm install
```

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to [Supabase Dashboard](https://app.supabase.com/projects)
   - Select your project
   - Go to Project Settings > API

3. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 3. Set Up Database Tables

1. Run the database migration in your Supabase SQL Editor:
   ```sql
   -- Copy and paste the contents of migrations/001_refactor_to_hierarchical.sql
   ```

### 4. Configure Row Level Security (RLS)

This is **CRITICAL** - the app won't work without proper RLS setup.

#### Option 1: Automatic Setup (Recommended)
```bash
npm install dotenv @supabase/supabase-js
node scripts/setup-supabase-rls.js
```

#### Option 2: Manual Setup
1. Go to Supabase Dashboard > SQL Editor
2. Copy and paste the contents of `supabase/enable-public-access.sql`
3. Execute the SQL

### 5. Start the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## Troubleshooting

### "Row Level Security Policy" Error

If you see an error like "new row violates row-level security policy for table 'goals'", it means RLS policies aren't properly configured.

**Solution:**
1. Make sure you have the `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local`
2. Run the setup script: `node scripts/setup-supabase-rls.js`
3. Alternatively, manually execute the SQL in `supabase/enable-public-access.sql`

### "Goal not found" Errors

This usually happens when the frontend has stale goal IDs. The application will automatically refresh data when this occurs.

### Docker Issues

If using Docker and you see database connection errors:
1. Make sure Docker is running
2. Run: `docker-compose down && docker-compose up`

## Development vs Production

### Development Setup (Current)
- Uses public access policies for ease of development
- No authentication required
- **WARNING: Do not use in production**

### Production Setup (TODO)
- Implement proper authentication
- Create restricted RLS policies
- Add user roles and permissions

## Database Schema

The application uses the following main tables:
- `districts`: School districts or organizations
- `goals`: Hierarchical strategic objectives, goals, and sub-goals
- `metrics`: Measurable outcomes attached to goals

## API Endpoints

- `GET /api/districts` - List all districts
- `GET /api/districts/[slug]` - Get district with full goal hierarchy
- `POST /api/districts/[slug]/goals` - Create new goal
- `PUT /api/districts/[slug]/goals` - Update existing goal
- `DELETE /api/districts/[slug]/goals` - Delete goal

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes* | Service role key for admin operations |

*Required for RLS setup script and admin operations

## Need Help?

1. Check the console for detailed error messages
2. Verify your Supabase credentials are correct
3. Ensure RLS policies are properly configured
4. Check the Supabase dashboard for any issues

For development questions, refer to the codebase documentation or create an issue in the repository.