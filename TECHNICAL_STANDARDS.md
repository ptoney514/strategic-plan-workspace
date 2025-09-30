# Technical Standards & Code Quality Guidelines

## Strategic Plan Workspace Technical Standards

This document defines the technical standards, coding conventions, and quality requirements for all projects in the strategic-plan-workspace.

---

## 🎨 Code Style & Formatting

### TypeScript Standards

#### Strict Mode Configuration
```typescript
// tsconfig.json - Required for all projects
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### Type Definitions
```typescript
// ✅ GOOD: Explicit types
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

function processUser(user: User): ProcessedUser {
  return transformUser(user);
}

// ❌ BAD: Implicit any
function processData(data) {  // Missing type
  return data.map(item => item.value);
}
```

#### Naming Conventions
```typescript
// Interfaces: PascalCase with descriptive names
interface GoalMetrics {
  completionRate: number;
  targetValue: number;
}

// Types: PascalCase for object types
type GoalStatus = 'pending' | 'active' | 'completed';

// Enums: PascalCase with CONSTANT_CASE values
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_TIMEOUT_MS = 5000;

// Functions: camelCase
function calculateProgress(current: number, total: number): number {
  return (current / total) * 100;
}

// React Components: PascalCase
const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  return <div>{goal.title}</div>;
};

// Custom Hooks: camelCase starting with 'use'
function useGoalData(goalId: string) {
  // Hook implementation
}
```

### React/JSX Standards

#### Component Structure
```typescript
// components/GoalCard/GoalCard.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { GoalCardProps } from './GoalCard.types';
import { useGoalActions } from '@/hooks/useGoalActions';
import styles from './GoalCard.module.css';

/**
 * Displays a goal card with interactive features
 * @param goal - The goal data to display
 * @param onUpdate - Callback when goal is updated
 */
export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onUpdate,
  className,
  ...restProps
}) => {
  // State declarations
  const [isEditing, setIsEditing] = useState(false);
  
  // Custom hooks
  const { updateGoal, deleteGoal } = useGoalActions();
  
  // Computed values
  const progressPercentage = useMemo(
    () => (goal.current / goal.target) * 100,
    [goal.current, goal.target]
  );
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependency]);
  
  // Event handlers
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = async (updatedGoal: Goal) => {
    await updateGoal(updatedGoal);
    setIsEditing(false);
    onUpdate?.(updatedGoal);
  };
  
  // Render
  return (
    <div 
      className={`goal-card ${className || ''}`}
      data-testid="goal-card"
      {...restProps}
    >
      {/* Component JSX */}
    </div>
  );
};

// Default export for lazy loading
export default GoalCard;
```

#### Props & State Management
```typescript
// ✅ GOOD: Destructured props with defaults
const Component: React.FC<Props> = ({ 
  title = 'Default Title',
  isActive = false,
  children 
}) => {
  // Component logic
};

// ❌ BAD: Props accessed directly
const Component = (props) => {
  return <div>{props.title}</div>;
};

// ✅ GOOD: Grouped state when related
const [formState, setFormState] = useState({
  name: '',
  email: '',
  message: '',
});

// ❌ BAD: Excessive individual states
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [message, setMessage] = useState('');
```

### CSS & Styling Standards

#### Tailwind CSS Usage
```typescript
// ✅ GOOD: Organized class names
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
    Title
  </h2>
</div>

// ✅ GOOD: Extracted for complex styling
const cardStyles = cn(
  'flex flex-col gap-4 p-6',
  'bg-white rounded-lg shadow-md',
  'dark:bg-gray-800',
  isActive && 'border-2 border-blue-500',
  isDisabled && 'opacity-50 cursor-not-allowed'
);

// ❌ BAD: Inline style objects
<div style={{ display: 'flex', padding: '20px' }}>
```

#### CSS Variables for Theming
```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme values */
}
```

---

## 🏗 Architecture Standards

### File Organization

```
src/
├── components/          # UI components
│   ├── ui/             # Primitive/base components
│   │   ├── Button/
│   │   ├── Card/
│   │   └── Input/
│   ├── features/       # Feature-specific components
│   │   ├── GoalList/
│   │   ├── MetricChart/
│   │   └── Dashboard/
│   └── layouts/        # Layout components
│       ├── Header/
│       ├── Sidebar/
│       └── MainLayout/
├── lib/                # Libraries and utilities
│   ├── supabase/      # Database configuration
│   ├── types/         # Shared TypeScript types
│   ├── utils/         # Helper functions
│   ├── constants/     # App constants
│   └── hooks/         # Custom React hooks
├── services/          # Business logic / API calls
│   ├── goalService.ts
│   ├── metricService.ts
│   └── authService.ts
├── pages/             # Page components
└── styles/            # Global styles
```

### Separation of Concerns

#### Service Layer Pattern
```typescript
// services/goalService.ts
export class GoalService {
  static async fetchGoals(districtId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('spb_goals')
      .select('*')
      .eq('district_id', districtId);
    
    if (error) throw new ApiError(error.message, error.code);
    return data;
  }
}

// components/GoalList.tsx
const GoalList: React.FC = () => {
  const { districtId } = useAuth();
  const { data: goals, error, isLoading } = useQuery(
    ['goals', districtId],
    () => GoalService.fetchGoals(districtId)
  );
  
  // Presentation logic only
};
```

#### Custom Hooks for Logic
```typescript
// hooks/useGoalForm.ts
export function useGoalForm(initialGoal?: Goal) {
  const [formData, setFormData] = useState(initialGoal || defaultGoal);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const validate = () => {
    // Validation logic
  };
  
  const handleSubmit = async () => {
    // Submit logic
  };
  
  return {
    formData,
    errors,
    setFormData,
    handleSubmit,
    isValid: Object.keys(errors).length === 0,
  };
}
```

---

## 🔒 Security Standards

### Input Validation

```typescript
// ✅ GOOD: Validate all user input
import { z } from 'zod';

const GoalSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  targetValue: z.number().positive(),
  dueDate: z.date().min(new Date()),
});

function validateGoalInput(input: unknown): Goal {
  return GoalSchema.parse(input);
}

// ❌ BAD: Trust user input
function saveGoal(input: any) {
  database.save(input); // Dangerous!
}
```

### SQL Injection Prevention

```typescript
// ✅ GOOD: Use parameterized queries
const { data } = await supabase
  .from('spb_goals')
  .select('*')
  .eq('user_id', userId)  // Safe parameterization
  .eq('status', status);

// ❌ BAD: String concatenation
const query = `SELECT * FROM goals WHERE user_id = '${userId}'`; // Vulnerable!
```

### XSS Prevention

```typescript
// ✅ GOOD: React automatically escapes
<div>{userInput}</div>  // Safe

// ⚠️ CAREFUL: Only use with trusted content
<div dangerouslySetInnerHTML={{ __html: trustedHtml }} />

// ✅ GOOD: Sanitize if needed
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

### Authentication & Authorization

```typescript
// ✅ GOOD: Check auth on every request
export async function GET(req: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check permissions
  if (!hasPermission(session.user, 'read:goals')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Process request
}
```

---

## ⚡ Performance Standards

### React Optimization

```typescript
// ✅ GOOD: Memoize expensive computations
const expensiveValue = useMemo(
  () => computeExpensiveValue(data),
  [data]
);

// ✅ GOOD: Memoize callbacks
const handleClick = useCallback(
  (id: string) => {
    // Handle click
  },
  [dependency]
);

// ✅ GOOD: Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// ✅ GOOD: Use React.memo for pure components
export const PureComponent = memo(({ data }: Props) => {
  return <div>{data.value}</div>;
});
```

### Data Fetching

```typescript
// ✅ GOOD: Implement pagination
const { data } = await supabase
  .from('spb_goals')
  .select('*')
  .range(offset, offset + pageSize - 1)
  .order('created_at', { ascending: false });

// ✅ GOOD: Use proper caching
const { data } = useQuery(
  ['goals', filters],
  fetchGoals,
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
);

// ✅ GOOD: Implement optimistic updates
const mutation = useMutation(updateGoal, {
  onMutate: async (newGoal) => {
    await queryClient.cancelQueries(['goals']);
    const previousGoals = queryClient.getQueryData(['goals']);
    queryClient.setQueryData(['goals'], old => [...old, newGoal]);
    return { previousGoals };
  },
  onError: (err, newGoal, context) => {
    queryClient.setQueryData(['goals'], context.previousGoals);
  },
});
```

### Bundle Size Optimization

```typescript
// ✅ GOOD: Dynamic imports for large libraries
const loadChart = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};

// ✅ GOOD: Tree-shakeable imports
import { debounce } from 'lodash-es/debounce';  // Not entire lodash

// ❌ BAD: Import entire library
import _ from 'lodash';  // Imports everything
```

---

## 🧪 Testing Standards

### Unit Testing Requirements

```typescript
// Every component should have tests
describe('GoalCard', () => {
  it('renders goal information correctly', () => {
    const goal = createMockGoal();
    render(<GoalCard goal={goal} />);
    
    expect(screen.getByText(goal.title)).toBeInTheDocument();
    expect(screen.getByText(goal.description)).toBeInTheDocument();
  });
  
  it('handles click events', async () => {
    const handleClick = jest.fn();
    const goal = createMockGoal();
    
    render(<GoalCard goal={goal} onClick={handleClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith(goal);
  });
  
  it('displays loading state', () => {
    render(<GoalCard goal={null} isLoading />);
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });
  
  it('handles error state', () => {
    const error = new Error('Failed to load');
    render(<GoalCard goal={null} error={error} />);
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
  });
});
```

### Test Coverage Requirements

```javascript
// jest.config.js / vitest.config.js
{
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

---

## 📊 Error Handling Standards

### Error Boundaries

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, info: ErrorInfo) {
    logErrorToService(error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
// ✅ GOOD: Comprehensive error handling
try {
  const data = await fetchData();
  return { success: true, data };
} catch (error) {
  if (error instanceof ApiError) {
    logger.warn('API error:', error);
    return { success: false, error: error.message };
  }
  
  if (error instanceof NetworkError) {
    logger.error('Network error:', error);
    return { success: false, error: 'Network unavailable' };
  }
  
  logger.error('Unexpected error:', error);
  captureException(error); // Send to monitoring
  return { success: false, error: 'An unexpected error occurred' };
}
```

---

## 📝 Documentation Standards

### Component Documentation

```typescript
/**
 * GoalCard displays a single goal with progress tracking
 * 
 * @component
 * @example
 * <GoalCard
 *   goal={goalData}
 *   onUpdate={handleUpdate}
 *   variant="compact"
 * />
 */
interface GoalCardProps {
  /** The goal data to display */
  goal: Goal;
  /** Callback fired when goal is updated */
  onUpdate?: (goal: Goal) => void;
  /** Display variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Additional CSS classes */
  className?: string;
}
```

### Function Documentation

```typescript
/**
 * Calculates the completion percentage for a goal
 * @param current - Current progress value
 * @param target - Target value to reach
 * @returns Percentage between 0 and 100
 * @throws {Error} If target is 0 or negative
 * 
 * @example
 * const progress = calculateProgress(75, 100); // Returns 75
 */
function calculateProgress(current: number, target: number): number {
  if (target <= 0) {
    throw new Error('Target must be positive');
  }
  return Math.min(100, (current / target) * 100);
}
```

---

## 🚦 Git & Version Control Standards

### Commit Message Format

```bash
# Format: type(scope): description

feat(goals): add goal duplication feature
fix(auth): resolve session timeout issue
docs(api): update REST endpoint documentation
style(dashboard): improve responsive layout
refactor(components): simplify GoalCard logic
test(metrics): add unit tests for calculations
perf(queries): optimize database queries
chore(deps): update dependencies
```

### Branch Naming

```bash
feature/add-goal-templates
fix/dashboard-loading-issue
refactor/simplify-auth-flow
docs/update-api-guide
test/add-e2e-tests
perf/optimize-bundle-size
```

---

## 📋 Code Review Checklist

### Before Submitting PR

- [ ] Code follows TypeScript strict mode
- [ ] All tests pass
- [ ] Test coverage meets requirements
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Documentation updated
- [ ] Accessibility considered
- [ ] Performance optimized
- [ ] Security best practices followed
- [ ] Code formatted (Prettier)
- [ ] Linting passes (ESLint)

### Review Focus Areas

1. **Logic Correctness**: Does it work as intended?
2. **Code Quality**: Is it maintainable and readable?
3. **Performance**: Are there bottlenecks?
4. **Security**: Are there vulnerabilities?
5. **Testing**: Is it adequately tested?
6. **Documentation**: Will others understand it?

---

## 🎯 Definition of Done

A feature/task is considered "done" when:

- [ ] Code is written and working
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests completed (if applicable)
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] Performance benchmarks met
- [ ] Accessibility standards met
- [ ] Security scan passed
- [ ] Deployed to staging environment
- [ ] Product owner acceptance received

---

*These standards apply to all projects in the strategic-plan-workspace and should be enforced through automated tooling where possible.*

*Last Updated: 2025-09-21*