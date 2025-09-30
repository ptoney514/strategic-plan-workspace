# CLAUDE.md - Strategic Plan Workspace

This workspace contains multiple related projects for the Strategic Plan Builder application.

## Project Vision & Mission
**Mission**: Build a comprehensive strategic planning system for educational districts to manage goals, metrics, and outcomes effectively.

**Core Principles**:
- Data-driven decision making
- Hierarchical goal alignment
- Multi-district scalability
- Performance tracking excellence

**Current Priority**: Migrating learnings from Next.js to Vite implementation while preparing for v2 ground-up rebuild.

## Workspace Structure

```
strategic-plan-workspace/
├── strategic-plan-builder/    # Original Next.js implementation
├── strategic-plan-vite/        # Vite + React proof of concept
└── strategic-plan-v2/          # New from-scratch implementation (when created)
```

## Projects Overview

### 1. strategic-plan-builder (Original)
- **Stack**: Next.js 14.2.5, TypeScript, Supabase, Tailwind CSS 3.x
- **Status**: Production application
- **Purpose**: Current working strategic planning system
- **Key Features**: 
  - Hierarchical goals (3-level structure)
  - Metrics tracking
  - District-based multi-tenancy
  - Row Level Security (RLS)

### 2. strategic-plan-vite (Proof of Concept)
- **Stack**: Vite 6.x, React 18, TypeScript, Tailwind CSS 3.x
- **Status**: Testing/exploration
- **Purpose**: Evaluate Vite as alternative to Next.js
- **Key Features**: 
  - Faster build times
  - Simplified configuration
  - Custom theme system

### 3. strategic-plan-v2 (Future)
- **Stack**: TBD based on learnings
- **Status**: Not yet created
- **Purpose**: Ground-up rebuild with lessons learned

## How Claude Code Should Work Across Projects

### When Building New Features in v2

1. **Reference Pattern**: Look for similar implementations in `strategic-plan-builder/`
   ```
   Example: "Look at how goals are structured in strategic-plan-builder/lib/types.ts"
   ```

2. **Component Migration**: Adapt components from original to new stack
   ```
   Example: "Adapt the GoalCard component from strategic-plan-builder but use the Vite project's styling approach"
   ```

3. **Data Models**: Use proven schemas from original
   ```
   Example: "Use the same spb_goals table structure from strategic-plan-builder"
   ```

## Cross-Project Conventions

### Database Tables
- All tables use `spb_` prefix (strategic plan builder)
- Hierarchical data uses `parent_id` self-referencing
- UUIDs for all primary keys

### Component Architecture
- Components in `components/` directory
- UI primitives in `components/ui/`
- Business logic separate from display components
- TypeScript interfaces in `lib/types.ts`

### API Patterns
- RESTful routes: `/api/[resource]/[action]`
- Consistent error handling with detailed logging
- Service layer abstraction in `lib/db-service.ts`

### Styling Approach
- Tailwind CSS utility-first
- CSS variables for theming
- Custom colors: background, foreground, primary, secondary, muted, card, border
- Consistent spacing and sizing scale

## Key Learnings to Apply

### From strategic-plan-builder:
✅ **What Works Well**:
- Hierarchical goal structure with parent_id
- RLS policies for multi-tenancy
- Slug-based routing for districts
- Component composition pattern

⚠️ **Areas for Improvement**:
- Simplify authentication flow
- Better state management (consider Zustand/Jotai)
- More efficient data fetching (consider React Query)
- Clearer separation of concerns

### From strategic-plan-vite:
✅ **What Works Well**:
- Faster development experience
- Simpler configuration
- Better HMR (Hot Module Replacement)
- Clean project structure

⚠️ **Considerations**:
- Need SSR solution if SEO required
- Different deployment approach than Next.js
- Manual API route setup needed

## Development Workflow

### Starting a New Project in This Workspace

1. Create project folder in workspace root
2. Reference this CLAUDE.md for conventions
3. Copy relevant types/interfaces from original
4. Adapt components with improvements
5. Use proven database schemas

### Example Commands for Claude Code

```
"Create a new Vite project in strategic-plan-v2 using the same component structure as strategic-plan-builder"

"Copy the goal hierarchy logic from strategic-plan-builder but implement with React Query instead of direct API calls"

"Use the same database schema from strategic-plan-builder/migrations but add the improvements we discussed"
```

## Common Tasks Across Projects

### Database Operations
- Migration scripts in `migrations/` or `supabase/migrations/`
- RLS policies in `supabase/policies/`
- Seed data in `supabase/seed.sql`

### Testing Approach
- Unit tests for utilities
- Component testing with React Testing Library
- E2E testing with Playwright (when applicable)

### Deployment
- **Next.js projects**: Vercel deployment
- **Vite projects**: Static hosting (Netlify, Vercel, etc.)
- **Database**: Supabase cloud

## Environment Variables

All projects use similar environment structure:
```
NEXT_PUBLIC_SUPABASE_URL / VITE_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (server-side only)
```

## Important Notes

1. **Always check existing implementations** before creating new features
2. **Maintain consistent naming** across all projects
3. **Document significant deviations** from established patterns
4. **Test database migrations** on local Supabase first
5. **Keep this CLAUDE.md updated** as patterns evolve

## Quick Reference Paths

Key files to reference when building new features:

- **Types & Interfaces**: `strategic-plan-builder/lib/types.ts`
- **Database Service**: `strategic-plan-builder/lib/db-service.ts`
- **Component Examples**: `strategic-plan-builder/components/`
- **API Routes**: `strategic-plan-builder/app/api/`
- **Database Schema**: `strategic-plan-builder/migrations/`
- **Tailwind Config**: `*/tailwind.config.js`
- **TypeScript Config**: `*/tsconfig.json`

## Session Management Guidelines

### Starting a Session
When working on this workspace, begin with:
1. Check WORKSPACE_STATUS.md for current sprint/phase
2. Review any blockers from previous session
3. Set clear goals for the session
4. Update status to "in_progress" for active tasks

### Ending a Session
Before concluding:
1. Update WORKSPACE_STATUS.md with progress
2. Document any decisions made
3. Note blockers or issues encountered
4. Set next session goals

## Development Standards

### Code Quality Checklist
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling with logging
- [ ] Component tests written
- [ ] Accessibility standards met
- [ ] Performance optimizations considered

### Security Requirements
- Never commit `.env` files
- Use environment variables for sensitive data
- Implement proper authentication checks
- Sanitize all user inputs
- Follow RLS policies for data access

## What NOT to Do

### Avoid These Patterns
- ❌ Direct database queries from components
- ❌ Mixing business logic with UI components
- ❌ Hardcoding environment-specific values
- ❌ Creating new files without checking existing ones
- ❌ Skipping TypeScript type definitions
- ❌ Implementing features without checking strategic-plan-builder first

### Always Remember
- ✅ Check existing implementations first
- ✅ Follow established patterns
- ✅ Document significant changes
- ✅ Test locally before committing
- ✅ Update relevant documentation