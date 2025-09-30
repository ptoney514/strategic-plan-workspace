# Supabase CLI Integration Guide

## Overview
This project now uses Supabase CLI for better database management and local development. This guide explains how to use the CLI effectively.

## Prerequisites
- Docker Desktop installed and running
- Supabase CLI installed (`brew install supabase/tap/supabase`)
- Supabase access token (get from https://supabase.com/dashboard/account/tokens)

## Local Development Setup

### 1. Start Local Supabase
```bash
npm run db:start
```
This starts a local Supabase instance with:
- API: http://127.0.0.1:54321
- Studio: http://127.0.0.1:54323
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres

### 2. Use Local Environment
Create a `.env.development.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### 3. Stop Local Supabase
```bash
npm run db:stop
```

## Database Management

### Creating Migrations
```bash
npm run db:new -- migration_name
```
This creates a new migration file in `supabase/migrations/`

### Running Migrations
```bash
npm run db:migrate
```
Applies pending migrations to your local database

### Reset Database
```bash
npm run db:reset
```
Resets the database and re-runs all migrations

### Generate TypeScript Types
```bash
npm run db:types
```
Updates `lib/database.types.ts` with the latest schema types

## Working with Cloud Database

### Pull Remote Schema Changes
```bash
npm run db:pull
```
Pulls any schema changes from the cloud database

### Push Local Changes to Cloud
```bash
npm run db:push
```
Pushes local migrations to the cloud database

### Check Schema Differences
```bash
npm run db:diff
```
Shows differences between local and remote schemas

## Migration Files

Migrations are stored in `supabase/migrations/` with timestamp prefixes:
- `20240823000000_initial_schema.sql` - Base schema setup
- `20240825000000_add_chart_type.sql` - Added chart type feature

## Seed Data

Local development seed data is in `supabase/seed.sql` and automatically loads when you run `db:reset`.

## Troubleshooting

### Docker Not Running
If you see "Cannot connect to Docker daemon", start Docker Desktop first.

### Migration Conflicts
If migrations are out of sync:
1. Run `supabase migration list` to see status
2. Use `supabase migration repair` to fix conflicts
3. Pull latest schema with `npm run db:pull`

### Type Generation Issues
If types aren't generating correctly:
1. Ensure you're logged in: `supabase login --token YOUR_TOKEN`
2. Check project link: `supabase link --project-ref qsftokjevxueboldvmzc`
3. Regenerate: `npm run db:types`

## Best Practices

1. **Always test migrations locally first** before pushing to cloud
2. **Create descriptive migration names** that explain the change
3. **Keep migrations small and focused** on single features
4. **Review generated types** after schema changes
5. **Use seed data** for consistent local development environment

## Available NPM Scripts

- `npm run db:start` - Start local Supabase
- `npm run db:stop` - Stop local Supabase
- `npm run db:reset` - Reset and re-seed database
- `npm run db:migrate` - Apply pending migrations
- `npm run db:types` - Generate TypeScript types
- `npm run db:pull` - Pull remote schema
- `npm run db:push` - Push to remote
- `npm run db:diff` - Check schema differences
- `npm run db:new` - Create new migration