# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Type

**Type**: Full-Stack Web Application  
**Category**: SaaS Platform for Educational Administration  
**Purpose**: Strategic planning and goal tracking system for school districts  
**Stage**: Development/MVP

## Workspace Management

### MY_WORKSPACE.md - Working Document
This file tracks current development status and should be automatically maintained.

#### Auto-Update Triggers
Claude Code should update MY_WORKSPACE.md WITHOUT being asked when:

**🔥 ACTIVE Section Updates**:
- Starting work on a new feature/bug → Update "Current Session Focus"
- Encountering a blocking issue → Add to "Blocking Issue"  
- Completing a task → Move to "Today's Wins"
- Finding root cause of bug → Add to "Session Notes"
- Identifying next steps → Update "Next 3 Actions"

**📋 BACKLOG Updates**:
- User mentions "let's do X next" → Add to appropriate section
- Completing current sprint items → Promote backlog items

**💡 IDEAS Updates**:
- User says "it would be cool if..." → Add to IDEAS
- User mentions "in the future..." → Add to IDEAS
- Discovering a potential improvement → Add to IDEAS

**📖 HISTORY Updates**:
- End of day/session → Move wins to history
- Completing a major milestone → Archive sprint details

#### Update Format
When updating MY_WORKSPACE.md, Claude should:
1. Preserve all sections and formatting
2. Add timestamp to "Last Updated" 
3. Keep ACTIVE section concise (under 10 lines)
4. Use bullet points for quick scanning
5. Archive old content rather than delete

#### What NOT to Track
- File-by-file change logs (git handles this)
- Code snippets (unless critical for context)
- Detailed error messages (just the solution)

#### Session Context
At start of each conversation, Claude should:
1. Read MY_WORKSPACE.md ACTIVE section
2. Note any blocking issues
3. Reference "Next 3 Actions" for direction
4. Update "Current Session Focus" if starting new work

#### Example Auto-Updates

**When fixing a bug:**

## 🔥 ACTIVE - What I'm Doing Now
**Current Session Focus**: Fixing player display issue after duplicate club removal  
**Blocking Issue**: Players query returning empty due to wrong club_id

---

**When completing work:**

### Today's Wins ✅
- Fixed duplicate club issue (deleted club 3db9df4d)
- Players now loading correctly with proper club_id

---

**When user has ideas:**

## 💡 IDEAS - Future Features
- Voice commands for adding players [Added: 2025-09-06]

---

**When planning next steps:**

**Next 3 Actions**:
1. Verify players display correctly
2. Run SQL scripts 05-08
3. Test full data flow

---

**When encountering blockers:**

**Blocking Issue**: API timeout on team fetch - need to add retry logic

---

**When discovering root causes:**

### Session Notes
- Root cause: duplicate clubs with different IDs
- Solution: DELETE_duplicate_club.sql
- Club ID to use: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11

---

**When session ends:**

### Today's Wins ✅
- ✅ Fixed duplicate club issue
- ✅ Real auth working with pernellg@proton.me  
- ✅ Teams showing with correct player counts

Move these to HISTORY section with date stamp


## Common Commands

**Development**
- `npm run dev` - Start development server (accessible at localhost:3000)
- `npm run build` - Build production version
- `npm run lint` - Run ESLint
- `npm run start` - Start production server

**Database Operations**
- `npm run setup:rls` - Configure Supabase Row Level Security policies
- `npm run cleanup:db` - Clean database (use with caution)

## Architecture Overview

**Technology Stack**
- Next.js 14.2.5 (App Router)
- TypeScript
- Supabase (PostgreSQL + Auth)
- Tailwind CSS + Radix UI components
- Recharts for data visualization

**Core Data Model**
- **Districts**: Organizations/school districts (`spb_districts` table)
- **Goals**: Hierarchical 3-level structure (`spb_goals` table):
  - Level 0: Strategic Objectives (e.g., "1")
  - Level 1: Goals (e.g., "1.1") 
  - Level 2: Sub-goals (e.g., "1.1.1")
- **Metrics**: Measurable outcomes attached to goals (`spb_metrics` table)

**Key Database Tables**
- `spb_districts`: District information with slug-based routing
- `spb_goals`: Hierarchical goals with `parent_id` self-reference
- `spb_metrics`: Performance metrics linked to goals

**Authentication Status**
- Currently in development mode with public access
- Authentication middleware temporarily disabled in `middleware.ts`
- Row Level Security (RLS) configured for public development access

## Project Structure

**API Routes**
- `/api/districts/[slug]` - Get district with full goal hierarchy
- `/api/districts/[slug]/goals` - CRUD operations for goals
- `/api/districts/[slug]/metrics` - CRUD operations for metrics
- `/api/districts/[slug]/goals/next-number` - Generate sequential goal numbers

**Core Components**
- `StrategicGoalsOverview` - Executive dashboard with goal summaries
- `GoalDrilldown` - Detailed goal management interface
- `PublicStrategicDashboard` - Public-facing dashboard
- `MetricCard` / `MetricInput` - Metric display and editing

**Data Services**
- `lib/db-service.ts` - Database operations with both direct Supabase calls and legacy API wrappers
- `lib/types.ts` - Core TypeScript interfaces and hierarchy building utilities
- `lib/supabase.ts` - Supabase client configuration with debug logging

## Recent Updates

**Latest Changes (2025-08-31)**
- Removed Docker configuration files - project now runs locally only
- Added new OverviewV2 component with enhanced strategic goals overview
- Improved API error handling and goal formatting
- Enhanced strategic goals dashboard with full hierarchy display
- Updated public dashboard with better responsive design

## Development Notes

**Database Schema Migration**
- The project has been refactored from a 2-level to 3-level hierarchy
- Migration script at `migrations/001_refactor_to_hierarchical.sql`
- Uses `spb_` prefix for all tables

**Goal Numbering System**
- Automatic sequential numbering (1, 1.1, 1.1.1)
- Handled by `getNextGoalNumber` utility function
- Sorting implemented to handle multi-level numbering correctly

**Data Flow**
- Frontend components use `dbService` legacy wrapper for API calls
- API routes use direct Supabase client calls
- Goal hierarchy building happens both client-side and server-side

**Environment Requirements**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for RLS setup)

**Development Setup**
- Run RLS setup script before first use: `npm run setup:rls`
- Database migration must be applied manually via Supabase SQL Editor
- Environment variables should be in `.env.local` file

## Important Patterns

**Hierarchical Data Handling**
- Use `buildGoalHierarchy` utility in `lib/types.ts` for client-side hierarchy building
- Server-side hierarchy building in API routes mirrors client-side logic
- Always sort by `goal_number` using proper multi-level numeric sorting

**Error Handling**
- Extensive logging in database operations
- Console debug statements throughout data flow
- Graceful handling of missing goals/districts with user-friendly messages

**Component Architecture**
- UI components in `components/ui/` from Radix UI
- Business logic components in `components/` root
- Clear separation between display and data management components

## Testing and Deployment

- No specific test framework currently configured
- Production deployment requires proper authentication setup
- RLS policies need to be updated for production security model