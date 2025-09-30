# Strategic Plan Builder Claude Context

## Auto-Standup Override
When working on this project, always:
- Check CLAUDE.md for architecture overview and recent updates
- Check DEVLOG.md for recent development history
- Focus on hierarchical goal management (3-level structure)
- Follow Next.js App Router patterns and Supabase conventions
- Verify RLS policies are properly configured

## Session Preferences
- Preferred session length: 2-3 hours
- Auto-commit every: 45 minutes (after feature completion)
- Testing priority: high (always run lint and build before marking complete)

## Project-Specific Context

### Current Architecture
- **Framework**: Next.js 14.2.5 with App Router
- **Database**: Supabase (PostgreSQL with RLS)
- **UI**: Tailwind CSS + Radix UI components
- **Data Viz**: Recharts for metrics and dashboards

### Key Focus Areas
1. **Goal Hierarchy**: 3-level structure (Strategic Objectives → Goals → Sub-goals)
2. **Dashboard Views**: Executive overview, detailed drilldown, public dashboard
3. **Data Flow**: Frontend uses dbService wrapper → API routes → Direct Supabase

### Active Development Priorities
- Enhance dashboard visualizations and metrics tracking
- Improve goal management UI/UX
- Optimize data fetching and caching strategies
- Maintain pixel-perfect dark mode implementation

## Development Workflow

### Before Starting
1. Check development server status (npm run dev)
2. Verify database connection to Supabase
3. Review recent commits for context
4. Check for any pending migrations

### During Development
- Always preserve existing code patterns
- Use existing UI components from components/ui/
- Follow the established goal numbering system (1, 1.1, 1.1.1)
- Maintain extensive logging for debugging

### Before Committing
- Run `npm run lint` to check code quality
- Run `npm run build` to verify production build
- Test both light and dark mode appearances
- Verify data persistence in Supabase

## Common Commands
```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run lint             # Run ESLint

# Database
npm run setup:rls        # Configure RLS policies
npm run cleanup:db       # Clean database (use carefully!)
```

## API Endpoints Reference
- `/api/districts/[slug]` - District with goal hierarchy
- `/api/districts/[slug]/goals` - Goal CRUD operations
- `/api/districts/[slug]/metrics` - Metric CRUD operations
- `/api/districts/[slug]/goals/next-number` - Sequential numbering

## Component Architecture
- **StrategicGoalsOverview** - Executive summary view
- **GoalDrilldown** - Detailed goal management
- **PublicStrategicDashboard** - Public-facing view
- **MetricCard/MetricInput** - Metric display and editing

## Database Tables (spb_ prefix)
- `spb_districts` - Organizations with slug routing
- `spb_goals` - Hierarchical goals with parent_id
- `spb_metrics` - Performance metrics linked to goals

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (for RLS setup)
```

## Known Issues & Workarounds
- Authentication temporarily disabled for development
- RLS policies set for public access during dev
- Goal hierarchy building happens both client and server side

## Testing Checklist
- [ ] Goal creation at all three levels
- [ ] Metric input and updates
- [ ] Dashboard data accuracy
- [ ] Dark mode consistency
- [ ] Responsive design on mobile
- [ ] Goal numbering sequence

## Debugging Tips
- Check console for extensive debug logging
- Verify Supabase connection in lib/supabase.ts
- Review network tab for API response data
- Check goal hierarchy building in lib/types.ts

## Project Conventions
- No emojis in code unless explicitly requested
- Prefer editing existing files over creating new ones
- Never create documentation files proactively
- Always check existing patterns before implementing
- Use TypeScript strict mode conventions