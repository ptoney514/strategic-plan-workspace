# Development Workflow Guide

## Strategic Plan Workspace Development Standards

This guide defines the standard workflows and procedures for all projects in the strategic-plan-workspace.

---

## 🚀 Quick Start Workflows

### Starting Your Development Session

```bash
# 1. Navigate to workspace
cd /Volumes/Samsung\ 2TB/Projects/02-development/strategic-plan-workspace

# 2. Check current status
cat WORKSPACE_STATUS.md

# 3. Pick your project
cd strategic-plan-vite  # or strategic-plan-builder

# 4. Start development
npm run dev

# 5. Open Supabase local (if needed)
npx supabase start
```

### Session Checklist
- [ ] Review WORKSPACE_STATUS.md for current phase
- [ ] Check for any blockers from previous session
- [ ] Set clear goals for this session
- [ ] Update your project's package dependencies if needed
- [ ] Verify local Supabase is running (if working with database)

---

## 📋 Standard Development Workflows

### 1. Starting a New Feature

#### Step 1: Planning
```markdown
1. Check WORKSPACE_STATUS.md for related work
2. Review existing implementations in strategic-plan-builder
3. Create feature branch (if using git)
4. Update WORKSPACE_STATUS.md "In Progress" section
```

#### Step 2: Implementation Pattern
```bash
# For strategic-plan-builder (Next.js)
git checkout -b feature/your-feature-name
npm run dev

# For strategic-plan-vite (Vite)
git checkout -b feature/your-feature-name
npm run dev

# For strategic-plan-v2 (when created)
# Follow PROJECT_TEMPLATE.md
```

#### Step 3: Feature Development Flow
1. **Check Existing Code**
   ```bash
   # Look for similar implementations
   grep -r "similar-feature" strategic-plan-builder/
   ```

2. **Create Component Structure**
   ```
   components/
   └── YourFeature/
       ├── index.ts           # Public API
       ├── YourFeature.tsx    # Main component
       ├── YourFeature.test.tsx # Tests
       └── YourFeature.types.ts # TypeScript types
   ```

3. **Implement with Standards**
   - Use TypeScript strict mode
   - Follow existing patterns
   - Add proper error handling
   - Include accessibility attributes

4. **Test Your Implementation**
   ```bash
   npm test YourFeature
   npm run type-check
   npm run lint
   ```

---

### 2. Database Changes Workflow

#### Local Development
```bash
# 1. Start Supabase locally
npx supabase start

# 2. Create migration
npx supabase migration new your_migration_name

# 3. Edit the migration file
# migrations/[timestamp]_your_migration_name.sql

# 4. Apply migration
npx supabase migration up

# 5. Test with local data
npm run dev
```

#### Migration Template
```sql
-- migrations/xxx_add_new_feature.sql

BEGIN;

-- Add your schema changes
CREATE TABLE IF NOT EXISTS spb_your_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- your columns here
);

-- Add RLS policies
ALTER TABLE spb_your_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON spb_your_table
    FOR SELECT
    USING (auth.uid() = user_id);

-- Add indexes if needed
CREATE INDEX idx_your_table_user_id ON spb_your_table(user_id);

COMMIT;
```

#### Production Deployment
```bash
# 1. Test migration locally first!
npx supabase migration up

# 2. Review migration
cat migrations/[your-migration].sql

# 3. Push to Supabase
npx supabase db push

# 4. Verify in Supabase dashboard
open https://app.supabase.com/project/[project-id]
```

---

### 3. Component Development Workflow

#### Creating a New Component

```bash
# Use this pattern for all projects
mkdir -p components/ComponentName
touch components/ComponentName/index.ts
touch components/ComponentName/ComponentName.tsx
touch components/ComponentName/ComponentName.test.tsx
touch components/ComponentName/ComponentName.types.ts
```

#### Component Template
```typescript
// ComponentName.tsx
import React from 'react';
import { ComponentNameProps } from './ComponentName.types';

export const ComponentName: React.FC<ComponentNameProps> = ({
  // props
}) => {
  // Implementation
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
};

// index.ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName.types';
```

#### Testing Components
```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });
});
```

---

### 4. API Development Workflow

#### For Next.js (strategic-plan-builder)
```typescript
// app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('spb_table')
      .select('*');
      
    if (error) throw error;
    
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

#### For Vite (strategic-plan-vite)
```typescript
// src/api/resource.ts
import { supabase } from '@/lib/supabase/client';

export const getResource = async () => {
  const { data, error } = await supabase
    .from('spb_table')
    .select('*');
    
  if (error) throw error;
  return data;
};
```

---

## 🧪 Testing Workflows

### Unit Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test ComponentName

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Integration Testing
```bash
# Run integration tests
npm run test:integration

# Test specific API endpoint
npm run test:api /api/goals
```

### E2E Testing (When implemented)
```bash
# Start application
npm run dev

# In another terminal
npm run test:e2e

# Run specific E2E test
npm run test:e2e auth.spec.ts
```

---

## 🚢 Deployment Workflows

### Development Deployment

#### Strategic-plan-builder (Next.js)
```bash
# 1. Build locally first
npm run build

# 2. Test production build
npm run start

# 3. Deploy to Vercel
vercel --prod
```

#### Strategic-plan-vite (Vite)
```bash
# 1. Build for production
npm run build

# 2. Preview production build
npm run preview

# 3. Deploy to hosting
# Netlify
netlify deploy --prod

# Or Vercel
vercel --prod
```

### Production Deployment Checklist
- [ ] All tests passing
- [ ] TypeScript no errors
- [ ] Linting passes
- [ ] Build succeeds locally
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Security scan completed
- [ ] Documentation updated

---

## 🐛 Debugging Workflows

### Common Issues & Solutions

#### Issue: Module not found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: TypeScript errors
```bash
# Check for type errors
npm run type-check

# Auto-fix if possible
npm run lint:fix
```

#### Issue: Supabase connection errors
```bash
# Check Supabase status
npx supabase status

# Restart Supabase
npx supabase stop
npx supabase start
```

### Debug Commands
```bash
# Check Node version
node --version  # Should be 18+

# Check npm version
npm --version  # Should be 9+

# Check TypeScript version
npx tsc --version

# Check Supabase CLI version
npx supabase --version

# Port conflicts
lsof -i :3000  # Check what's using port 3000
lsof -i :54322  # Check Supabase ports
```

---

## 📝 Code Review Checklist

Before submitting code for review:

### Code Quality
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code
- [ ] Proper error handling
- [ ] TypeScript types defined
- [ ] No any types (unless justified)

### Testing
- [ ] Unit tests written
- [ ] Tests passing
- [ ] Edge cases covered
- [ ] Error scenarios tested

### Documentation
- [ ] JSDoc comments for complex functions
- [ ] README updated if needed
- [ ] API documentation current
- [ ] WORKSPACE_STATUS.md updated

### Performance
- [ ] No unnecessary re-renders
- [ ] Proper memoization used
- [ ] Database queries optimized
- [ ] Bundle size impact checked

### Security
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] SQL injection prevented
- [ ] XSS protection in place

---

## 🔄 Git Workflows

### Branch Naming Convention
```
feature/description    # New features
fix/description       # Bug fixes
refactor/description  # Code refactoring
docs/description      # Documentation
test/description      # Test additions
perf/description      # Performance improvements
```

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

#### Examples:
```
feat(goals): add goal duplication feature
fix(auth): resolve session timeout issue
docs(api): update REST endpoint documentation
refactor(components): simplify Goal component logic
test(metrics): add unit tests for MetricCard
perf(dashboard): optimize data fetching
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

---

## 🛠 Utility Scripts

### Useful Development Scripts

```bash
# Clean and reinstall everything
npm run clean:all

# Check for outdated packages
npm outdated

# Update dependencies safely
npm update

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Generate TypeScript coverage report
npm run type-coverage

# Analyze bundle size
npm run analyze
```

### Custom Scripts to Add
```json
// package.json scripts section
{
  "scripts": {
    "clean:all": "rm -rf node_modules .next dist && npm i",
    "type-check": "tsc --noEmit",
    "type-coverage": "type-coverage",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "analyze": "ANALYZE=true npm run build"
  }
}
```

---

## 📚 Resources & References

### Internal Documentation
- [CLAUDE.md](./CLAUDE.md) - Core project instructions
- [WORKSPACE_STATUS.md](./WORKSPACE_STATUS.md) - Current project status
- [TECHNICAL_STANDARDS.md](./TECHNICAL_STANDARDS.md) - Coding standards
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) - Testing guidelines

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Environment Setup
- Node.js 18+ required
- npm 9+ recommended
- VS Code with recommended extensions
- Supabase CLI installed globally

---

## 🎯 Best Practices Summary

### Do's ✅
- Check existing code before creating new
- Follow established patterns
- Write tests for new features
- Update documentation
- Use TypeScript strictly
- Handle errors gracefully
- Consider accessibility
- Optimize performance

### Don'ts ❌
- Don't skip tests
- Don't ignore TypeScript errors
- Don't commit secrets
- Don't use any type
- Don't create unnecessary files
- Don't mix concerns
- Don't bypass code review
- Don't deploy untested code

---

*Last Updated: 2025-09-21*
*This is a living document - update as workflows evolve*