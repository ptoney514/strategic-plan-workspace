# Project Template - Strategic Plan v2 & Future Projects

## How to Use This Template

This template provides the standard structure for creating new projects in the strategic-plan-workspace, particularly for strategic-plan-v2 and any future implementations.

---

## 🎯 New Project Setup Checklist

### Phase 1: Initial Setup
- [ ] Create project directory in workspace root
- [ ] Initialize with appropriate framework
- [ ] Set up version control
- [ ] Configure TypeScript with strict mode
- [ ] Set up linting and formatting
- [ ] Configure environment variables
- [ ] Create initial documentation

### Phase 2: Core Configuration
- [ ] Set up Supabase connection
- [ ] Configure authentication
- [ ] Set up routing
- [ ] Implement base layout
- [ ] Configure build tools
- [ ] Set up testing framework
- [ ] Configure CI/CD pipeline

### Phase 3: Feature Development
- [ ] Copy relevant types from strategic-plan-builder
- [ ] Implement core data models
- [ ] Create base components
- [ ] Set up state management
- [ ] Implement error handling
- [ ] Add performance monitoring
- [ ] Configure deployment

---

## 📁 Recommended Project Structure

```
strategic-plan-[version]/
├── .github/                    # GitHub configuration
│   ├── workflows/             # CI/CD workflows
│   └── ISSUE_TEMPLATE/        # Issue templates
├── docs/                      # Project documentation
│   ├── api/                  # API documentation
│   ├── architecture/         # Architecture decisions
│   └── guides/              # User/developer guides
├── public/                    # Static assets
├── src/                       # Source code
│   ├── components/           # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── features/       # Feature-specific components
│   │   └── layouts/        # Layout components
│   ├── lib/                 # Libraries and utilities
│   │   ├── supabase/       # Database client
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helper functions
│   │   └── hooks/          # Custom React hooks
│   ├── pages/               # Page components (or app/ for Next.js 13+)
│   ├── styles/              # Global styles
│   ├── services/            # Business logic/API services
│   └── App.tsx              # Root component (or _app.tsx for Next.js)
├── tests/                     # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/               # End-to-end tests
├── migrations/               # Database migrations
├── scripts/                  # Build/deployment scripts
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── CLAUDE.md               # Project-specific Claude instructions
├── PROJECT_STATUS.md       # Current project status
├── README.md              # Project documentation
├── package.json           # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── [framework.config.js] # Framework configuration
```

---

## 🚀 Initial Setup Commands

### For Vite-based Project (Recommended for v2)

```bash
# Create project
npm create vite@latest strategic-plan-v2 -- --template react-ts

# Navigate to project
cd strategic-plan-v2

# Install core dependencies
npm install

# Add essential packages
npm install -D \
  @types/react @types/react-dom \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint eslint-plugin-react \
  prettier tailwindcss \
  @testing-library/react \
  @testing-library/jest-dom \
  vitest jsdom

# Add Supabase
npm install @supabase/supabase-js

# Add routing
npm install react-router-dom

# Initialize Tailwind
npx tailwindcss init -p

# Set up Supabase
npx supabase init
```

### For Next.js Project (If SSR needed)

```bash
# Create project
npx create-next-app@latest strategic-plan-v2 \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

# Navigate to project
cd strategic-plan-v2

# Add Supabase
npm install @supabase/supabase-js @supabase/ssr

# Add testing
npm install -D \
  @testing-library/react \
  @testing-library/jest-dom \
  jest jest-environment-jsdom

# Initialize Supabase
npx supabase init
```

---

## 📝 Essential Configuration Files

### 1. CLAUDE.md (Project-Specific)

```markdown
# CLAUDE.md - Strategic Plan V2

## Project Overview
[Brief description of this specific implementation]

## Technology Choices
- Framework: [Vite/Next.js]
- State Management: [Zustand/Jotai/Context]
- Data Fetching: [React Query/SWR]
- Testing: [Vitest/Jest]

## Key Differences from Previous Versions
- [List architectural changes]
- [List technical improvements]
- [List feature additions]

## Development Guidelines
[Project-specific guidelines]

## Current Focus
[What's being actively developed]
```

### 2. PROJECT_STATUS.md (Project-Specific)

```markdown
# Project Status - Strategic Plan V2

## Last Updated: [Date]

## Current Phase: [Phase Name]

## Completed ✅
- [List completed items]

## In Progress 🚧
- [ ] [Current tasks]

## Up Next 📋
- [Planned tasks]

## Blockers 🚨
- [Any blocking issues]

## Notes
[Session notes, decisions, learnings]
```

### 3. tsconfig.json (Strict TypeScript)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 4. .env.example

```env
# Supabase
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-anon-key

# Environment
VITE_APP_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=false
```

### 5. Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "clean": "rm -rf dist node_modules",
    "clean:install": "npm run clean && npm install",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:status": "supabase status",
    "migrate:up": "supabase migration up",
    "migrate:new": "supabase migration new",
    "analyze": "vite-bundle-visualizer"
  }
}
```

---

## 🏗 Implementation Patterns

### Component Template

```typescript
// components/features/ExampleFeature/ExampleFeature.tsx
import React from 'react';
import { ExampleFeatureProps } from './ExampleFeature.types';
import styles from './ExampleFeature.module.css'; // if using CSS modules

export const ExampleFeature: React.FC<ExampleFeatureProps> = ({
  title,
  children,
  ...props
}) => {
  return (
    <div className="example-feature" {...props}>
      <h2>{title}</h2>
      {children}
    </div>
  );
};

// ExampleFeature.types.ts
export interface ExampleFeatureProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

// index.ts
export { ExampleFeature } from './ExampleFeature';
export type { ExampleFeatureProps } from './ExampleFeature.types';
```

### Service Layer Pattern

```typescript
// services/goalService.ts
import { supabase } from '@/lib/supabase/client';
import { Goal, CreateGoalInput, UpdateGoalInput } from '@/lib/types';

export class GoalService {
  static async getGoals(): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('spb_goals')
      .select('*')
      .order('order_index');
      
    if (error) throw error;
    return data || [];
  }
  
  static async createGoal(input: CreateGoalInput): Promise<Goal> {
    const { data, error } = await supabase
      .from('spb_goals')
      .insert(input)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  static async updateGoal(id: string, input: UpdateGoalInput): Promise<Goal> {
    const { data, error } = await supabase
      .from('spb_goals')
      .update(input)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  static async deleteGoal(id: string): Promise<void> {
    const { error } = await supabase
      .from('spb_goals')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
}
```

### Custom Hook Pattern

```typescript
// hooks/useGoals.ts
import { useState, useEffect } from 'react';
import { Goal } from '@/lib/types';
import { GoalService } from '@/services/goalService';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetchGoals();
  }, []);
  
  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await GoalService.getGoals();
      setGoals(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  
  const createGoal = async (input: CreateGoalInput) => {
    try {
      const newGoal = await GoalService.createGoal(input);
      setGoals([...goals, newGoal]);
      return newGoal;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };
  
  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
    createGoal,
  };
};
```

---

## 🧪 Testing Setup

### Unit Test Example

```typescript
// components/GoalCard/GoalCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GoalCard } from './GoalCard';

describe('GoalCard', () => {
  const mockGoal = {
    id: '1',
    title: 'Test Goal',
    description: 'Test Description',
  };
  
  it('renders goal information', () => {
    render(<GoalCard goal={mockGoal} />);
    
    expect(screen.getByText('Test Goal')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<GoalCard goal={mockGoal} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith(mockGoal);
  });
});
```

### Integration Test Example

```typescript
// tests/integration/goals.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useGoals } from '@/hooks/useGoals';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/goals', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', title: 'Goal 1' },
      { id: '2', title: 'Goal 2' },
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Goals Integration', () => {
  it('fetches and displays goals', async () => {
    const { result } = renderHook(() => useGoals());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.goals).toHaveLength(2);
    expect(result.current.goals[0].title).toBe('Goal 1');
  });
});
```

---

## 🚀 Deployment Configuration

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[dev]
  command = "npm run dev"
  port = 5173
```

---

## 📊 Performance Targets

New projects should aim for these metrics:

| Metric | Target | Critical |
|--------|--------|----------|
| Lighthouse Score | >90 | >75 |
| First Contentful Paint | <1.5s | <2.5s |
| Time to Interactive | <2.5s | <3.5s |
| Bundle Size (gzipped) | <500KB | <750KB |
| Build Time | <15s | <30s |
| Test Coverage | >80% | >60% |

---

## 🔐 Security Checklist

- [ ] Environment variables properly configured
- [ ] Supabase RLS policies implemented
- [ ] Input validation on all forms
- [ ] XSS protection measures
- [ ] CORS properly configured
- [ ] Authentication checks on protected routes
- [ ] Rate limiting implemented
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies regularly updated
- [ ] Security headers configured

---

## 📋 Launch Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] TypeScript no errors
- [ ] Lint checks pass
- [ ] Documentation complete
- [ ] Performance targets met
- [ ] Security audit completed
- [ ] Accessibility audit passed
- [ ] Browser compatibility tested
- [ ] Mobile responsiveness verified
- [ ] Error tracking configured

### Launch Day
- [ ] Production environment variables set
- [ ] Database migrations run
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Rollback plan documented
- [ ] Team notified
- [ ] Support channels ready

### Post-Launch
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Document lessons learned
- [ ] Plan iteration improvements

---

## 🎯 Success Criteria

A new project is considered successfully set up when:

1. **Development Experience**
   - Hot reload working
   - TypeScript configured strictly
   - Linting and formatting automated
   - Testing framework operational

2. **Architecture**
   - Clear separation of concerns
   - Consistent file structure
   - Reusable components created
   - Service layer abstraction

3. **Documentation**
   - CLAUDE.md created and specific
   - PROJECT_STATUS.md initialized
   - README.md comprehensive
   - API documentation started

4. **Quality**
   - Tests written and passing
   - No TypeScript errors
   - Performance benchmarks met
   - Security measures in place

---

## 📚 Additional Resources

- [Strategic Plan Workspace Overview](./CLAUDE.md)
- [Development Workflow](./DEVELOPMENT_WORKFLOW.md)
- [Technical Standards](./TECHNICAL_STANDARDS.md)
- [Testing Strategy](./TESTING_STRATEGY.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Next.js Documentation](https://nextjs.org/docs)

---

*This template should be customized for each new project while maintaining the core structure and standards.*

*Last Updated: 2025-09-21*