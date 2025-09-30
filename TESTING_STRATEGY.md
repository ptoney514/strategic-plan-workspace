# Testing Strategy Guide

## Comprehensive Testing Approach for Strategic Plan Workspace

This guide defines the testing philosophy, strategies, and implementation patterns for all projects in the strategic-plan-workspace.

---

## 🎯 Testing Philosophy

### Core Principles

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how
2. **Progressive Coverage**: Start with critical paths, expand systematically
3. **Fast Feedback**: Unit tests should run in milliseconds
4. **Realistic Testing**: Use real-world scenarios and data
5. **Maintainable Tests**: Tests should be as clean as production code

### Testing Pyramid

```
         /\
        /E2E\       <- 10% - Critical user journeys
       /------\
      /  INT   \    <- 30% - Service & API integration
     /----------\
    /    UNIT    \  <- 60% - Component & function logic
   /______________\
```

---

## 🧪 Testing Levels

### 1. Unit Tests (60% of tests)

**Purpose**: Test individual components and functions in isolation

#### Component Testing Example

```typescript
// components/GoalCard/GoalCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalCard } from './GoalCard';
import { createMockGoal } from '@/tests/fixtures/goals';

describe('GoalCard', () => {
  const mockGoal = createMockGoal();
  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('displays goal information correctly', () => {
      render(<GoalCard goal={mockGoal} {...mockHandlers} />);
      
      expect(screen.getByText(mockGoal.title)).toBeInTheDocument();
      expect(screen.getByText(mockGoal.description)).toBeInTheDocument();
      expect(screen.getByLabelText(`Progress: ${mockGoal.progress}%`))
        .toBeInTheDocument();
    });

    it('shows correct status badge', () => {
      const activeGoal = { ...mockGoal, status: 'active' };
      render(<GoalCard goal={activeGoal} {...mockHandlers} />);
      
      expect(screen.getByText('Active')).toHaveClass('badge-success');
    });

    it('renders in compact mode', () => {
      render(<GoalCard goal={mockGoal} variant="compact" {...mockHandlers} />);
      
      expect(screen.queryByText(mockGoal.description)).not.toBeInTheDocument();
      expect(screen.getByTestId('goal-card')).toHaveClass('goal-card--compact');
    });
  });

  describe('Interactions', () => {
    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<GoalCard goal={mockGoal} {...mockHandlers} />);
      
      await user.click(screen.getByRole('button', { name: /edit/i }));
      
      expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockGoal);
      expect(mockHandlers.onEdit).toHaveBeenCalledTimes(1);
    });

    it('shows confirmation dialog before deletion', async () => {
      const user = userEvent.setup();
      render(<GoalCard goal={mockGoal} {...mockHandlers} />);
      
      await user.click(screen.getByRole('button', { name: /delete/i }));
      
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      
      await user.click(screen.getByRole('button', { name: /confirm/i }));
      
      await waitFor(() => {
        expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockGoal.id);
      });
    });

    it('updates progress when slider is moved', async () => {
      const user = userEvent.setup();
      render(<GoalCard goal={mockGoal} {...mockHandlers} editable />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '75' } });
      
      await waitFor(() => {
        expect(screen.getByLabelText('Progress: 75%')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<GoalCard goal={mockGoal} {...mockHandlers} />);
      
      expect(screen.getByRole('article')).toHaveAttribute(
        'aria-label',
        `Goal: ${mockGoal.title}`
      );
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<GoalCard goal={mockGoal} {...mockHandlers} />);
      
      await user.tab();
      expect(screen.getByRole('button', { name: /edit/i })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /delete/i })).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('displays error state when goal data is invalid', () => {
      const invalidGoal = { ...mockGoal, title: '' };
      render(<GoalCard goal={invalidGoal} {...mockHandlers} />);
      
      expect(screen.getByText(/invalid goal data/i)).toBeInTheDocument();
    });

    it('handles async operation failures gracefully', async () => {
      const failingHandler = jest.fn().mockRejectedValue(new Error('Network error'));
      render(<GoalCard goal={mockGoal} onEdit={failingHandler} />);
      
      await userEvent.click(screen.getByRole('button', { name: /edit/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/failed to update/i)).toBeInTheDocument();
      });
    });
  });
});
```

#### Utility Function Testing

```typescript
// utils/calculations.test.ts
import {
  calculateProgress,
  formatPercentage,
  calculateTrend,
  aggregateMetrics,
} from './calculations';

describe('Calculation Utilities', () => {
  describe('calculateProgress', () => {
    it('calculates percentage correctly', () => {
      expect(calculateProgress(50, 100)).toBe(50);
      expect(calculateProgress(75, 150)).toBe(50);
      expect(calculateProgress(100, 100)).toBe(100);
    });

    it('handles edge cases', () => {
      expect(calculateProgress(0, 100)).toBe(0);
      expect(calculateProgress(150, 100)).toBe(150); // Can exceed 100%
      expect(calculateProgress(50, 0)).toBe(0); // Division by zero
    });

    it('rounds to specified decimal places', () => {
      expect(calculateProgress(1, 3, 2)).toBe(33.33);
      expect(calculateProgress(2, 3, 0)).toBe(67);
    });

    it('throws error for invalid inputs', () => {
      expect(() => calculateProgress(-1, 100)).toThrow('Current value must be non-negative');
      expect(() => calculateProgress(50, -100)).toThrow('Target value must be positive');
      expect(() => calculateProgress(NaN, 100)).toThrow('Invalid number input');
    });
  });

  describe('calculateTrend', () => {
    it('identifies upward trend', () => {
      const data = [10, 15, 20, 25, 30];
      expect(calculateTrend(data)).toEqual({
        direction: 'up',
        percentage: 200,
        isSignificant: true,
      });
    });

    it('identifies downward trend', () => {
      const data = [30, 25, 20, 15, 10];
      expect(calculateTrend(data)).toEqual({
        direction: 'down',
        percentage: -66.67,
        isSignificant: true,
      });
    });

    it('identifies stable trend', () => {
      const data = [20, 21, 19, 20, 20];
      expect(calculateTrend(data)).toEqual({
        direction: 'stable',
        percentage: 0,
        isSignificant: false,
      });
    });
  });
});
```

### 2. Integration Tests (30% of tests)

**Purpose**: Test how different parts of the system work together

#### API Integration Testing

```typescript
// tests/integration/api/goals.test.ts
import { createMockServer } from '@/tests/utils/mockServer';
import { GoalService } from '@/services/goalService';
import { createTestDatabase } from '@/tests/utils/testDatabase';

describe('Goals API Integration', () => {
  let server: MockServer;
  let db: TestDatabase;

  beforeAll(async () => {
    server = createMockServer();
    db = await createTestDatabase();
  });

  afterAll(async () => {
    await server.close();
    await db.cleanup();
  });

  beforeEach(async () => {
    await db.seed();
  });

  describe('GET /api/goals', () => {
    it('returns paginated goals for authenticated user', async () => {
      const user = await db.createUser();
      const goals = await db.createGoals(user.id, 25);

      const response = await server.request('/api/goals', {
        headers: { Authorization: `Bearer ${user.token}` },
        query: { page: 1, limit: 10 },
      });

      expect(response.status).toBe(200);
      expect(response.data.goals).toHaveLength(10);
      expect(response.data.total).toBe(25);
      expect(response.data.page).toBe(1);
    });

    it('filters goals by status', async () => {
      const user = await db.createUser();
      await db.createGoals(user.id, 5, { status: 'active' });
      await db.createGoals(user.id, 3, { status: 'completed' });

      const response = await server.request('/api/goals', {
        headers: { Authorization: `Bearer ${user.token}` },
        query: { status: 'active' },
      });

      expect(response.data.goals).toHaveLength(5);
      expect(response.data.goals.every(g => g.status === 'active')).toBe(true);
    });

    it('returns 401 for unauthenticated requests', async () => {
      const response = await server.request('/api/goals');
      
      expect(response.status).toBe(401);
      expect(response.data.error).toBe('Authentication required');
    });
  });

  describe('POST /api/goals', () => {
    it('creates a new goal with valid data', async () => {
      const user = await db.createUser();
      const goalData = {
        title: 'New Goal',
        description: 'Test description',
        targetValue: 100,
        dueDate: '2025-12-31',
      };

      const response = await server.request('/api/goals', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: goalData,
      });

      expect(response.status).toBe(201);
      expect(response.data.goal).toMatchObject(goalData);
      expect(response.data.goal.id).toBeDefined();

      // Verify in database
      const dbGoal = await db.findGoal(response.data.goal.id);
      expect(dbGoal).toMatchObject(goalData);
    });

    it('validates required fields', async () => {
      const user = await db.createUser();
      
      const response = await server.request('/api/goals', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: { description: 'Missing title' },
      });

      expect(response.status).toBe(400);
      expect(response.data.errors).toContain('title is required');
    });

    it('enforces business rules', async () => {
      const user = await db.createUser({ plan: 'free' });
      await db.createGoals(user.id, 10); // Max for free plan

      const response = await server.request('/api/goals', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
        body: { title: 'Exceeds limit' },
      });

      expect(response.status).toBe(403);
      expect(response.data.error).toBe('Goal limit exceeded for free plan');
    });
  });
});
```

#### Database Integration Testing

```typescript
// tests/integration/database/goalRepository.test.ts
import { GoalRepository } from '@/repositories/goalRepository';
import { createTestSupabase } from '@/tests/utils/testSupabase';

describe('Goal Repository Integration', () => {
  let supabase: TestSupabase;
  let repository: GoalRepository;

  beforeAll(async () => {
    supabase = await createTestSupabase();
    repository = new GoalRepository(supabase);
  });

  afterAll(async () => {
    await supabase.cleanup();
  });

  describe('Complex Queries', () => {
    it('fetches hierarchical goal structure', async () => {
      const parent = await repository.create({
        title: 'Parent Goal',
        level: 1,
      });

      const children = await Promise.all([
        repository.create({ title: 'Child 1', parentId: parent.id, level: 2 }),
        repository.create({ title: 'Child 2', parentId: parent.id, level: 2 }),
      ]);

      const tree = await repository.getGoalTree(parent.id);

      expect(tree).toMatchObject({
        id: parent.id,
        title: 'Parent Goal',
        children: expect.arrayContaining([
          expect.objectContaining({ title: 'Child 1' }),
          expect.objectContaining({ title: 'Child 2' }),
        ]),
      });
    });

    it('aggregates metrics correctly', async () => {
      const districtId = 'district-123';
      await repository.createMultiple([
        { districtId, targetValue: 100, currentValue: 50 },
        { districtId, targetValue: 200, currentValue: 150 },
        { districtId, targetValue: 50, currentValue: 50 },
      ]);

      const metrics = await repository.getDistrictMetrics(districtId);

      expect(metrics).toEqual({
        totalGoals: 3,
        completedGoals: 1,
        averageProgress: 66.67,
        totalTargetValue: 350,
        totalCurrentValue: 250,
      });
    });

    it('handles concurrent updates with optimistic locking', async () => {
      const goal = await repository.create({ title: 'Concurrent Test' });

      // Simulate concurrent updates
      const update1 = repository.update(goal.id, {
        title: 'Update 1',
        version: goal.version,
      });

      const update2 = repository.update(goal.id, {
        title: 'Update 2',
        version: goal.version,
      });

      const results = await Promise.allSettled([update1, update2]);

      // One should succeed, one should fail
      const succeeded = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      expect(succeeded).toHaveLength(1);
      expect(failed).toHaveLength(1);
      expect(failed[0].reason.message).toContain('version conflict');
    });
  });
});
```

### 3. End-to-End Tests (10% of tests)

**Purpose**: Test complete user workflows through the entire application

#### E2E Test Example

```typescript
// tests/e2e/goalManagement.spec.ts
import { test, expect } from '@playwright/test';
import { loginAs, createTestUser } from './helpers/auth';
import { mockApiResponses } from './helpers/mocks';

test.describe('Goal Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    const user = await createTestUser();
    await loginAs(page, user);
  });

  test('complete goal creation and editing flow', async ({ page }) => {
    // Navigate to goals page
    await page.goto('/goals');
    await expect(page).toHaveTitle(/Goals/);

    // Click create button
    await page.getByRole('button', { name: /create goal/i }).click();

    // Fill out form
    await page.getByLabel('Title').fill('Q1 Revenue Target');
    await page.getByLabel('Description').fill('Achieve $1M in Q1 revenue');
    await page.getByLabel('Target Value').fill('1000000');
    await page.getByLabel('Due Date').fill('2025-03-31');
    
    // Select parent goal
    await page.getByLabel('Parent Goal').click();
    await page.getByRole('option', { name: 'Annual Revenue' }).click();

    // Submit form
    await page.getByRole('button', { name: /save/i }).click();

    // Verify success message
    await expect(page.getByText(/goal created successfully/i)).toBeVisible();

    // Verify goal appears in list
    await expect(page.getByRole('article', { name: 'Q1 Revenue Target' }))
      .toBeVisible();

    // Edit the goal
    await page.getByRole('article', { name: 'Q1 Revenue Target' })
      .getByRole('button', { name: /edit/i })
      .click();

    await page.getByLabel('Current Value').fill('250000');
    await page.getByRole('button', { name: /update/i }).click();

    // Verify progress is shown
    await expect(page.getByText('25% Complete')).toBeVisible();
  });

  test('goal deletion with confirmation', async ({ page }) => {
    // Setup: Create a goal
    await mockApiResponses(page, {
      '/api/goals': { goals: [{ id: '1', title: 'Test Goal' }] },
    });

    await page.goto('/goals');

    // Delete goal
    await page.getByRole('button', { name: /delete/i }).click();

    // Verify confirmation dialog
    await expect(page.getByRole('dialog')).toContainText(/are you sure/i);

    // Cancel first
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('article', { name: 'Test Goal' })).toBeVisible();

    // Delete again and confirm
    await page.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('button', { name: /confirm/i }).click();

    // Verify goal is removed
    await expect(page.getByRole('article', { name: 'Test Goal' }))
      .not.toBeVisible();
    
    await expect(page.getByText(/goal deleted successfully/i)).toBeVisible();
  });

  test('bulk operations on multiple goals', async ({ page }) => {
    await page.goto('/goals');

    // Select multiple goals
    await page.getByRole('checkbox', { name: /select all/i }).check();

    // Verify bulk actions appear
    await expect(page.getByText(/3 goals selected/i)).toBeVisible();

    // Bulk update status
    await page.getByRole('button', { name: /bulk actions/i }).click();
    await page.getByRole('menuitem', { name: /mark as complete/i }).click();

    // Confirm bulk action
    await page.getByRole('button', { name: /apply to 3 goals/i }).click();

    // Verify all goals show completed status
    const goals = page.getByRole('article');
    const count = await goals.count();
    
    for (let i = 0; i < count; i++) {
      await expect(goals.nth(i)).toContainText('Completed');
    }
  });
});
```

---

## 🛠 Testing Tools & Setup

### Tool Stack

```json
// package.json
{
  "devDependencies": {
    // Unit & Integration Testing
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "vitest": "^1.0.0",
    "jsdom": "^22.0.0",
    
    // E2E Testing
    "@playwright/test": "^1.40.0",
    
    // Mocking & Fixtures
    "msw": "^2.0.0",
    "@faker-js/faker": "^8.0.0",
    
    // Coverage
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

### Test Configuration

#### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.ts',
        '**/types.ts',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### Test Setup File

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';

// Start mock server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => server.close());

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'http://localhost:54321';
process.env.VITE_SUPABASE_ANON_KEY = 'test-key';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
};
```

---

## 📊 Test Data Management

### Fixtures & Factories

```typescript
// tests/fixtures/factories.ts
import { faker } from '@faker-js/faker';

export const goalFactory = {
  create: (overrides?: Partial<Goal>): Goal => ({
    id: faker.string.uuid(),
    title: faker.company.catchPhrase(),
    description: faker.lorem.paragraph(),
    targetValue: faker.number.int({ min: 100, max: 10000 }),
    currentValue: faker.number.int({ min: 0, max: 100 }),
    status: faker.helpers.arrayElement(['pending', 'active', 'completed']),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),
  
  createMany: (count: number, overrides?: Partial<Goal>): Goal[] => {
    return Array.from({ length: count }, () => goalFactory.create(overrides));
  },
  
  createHierarchy: (depth: number = 3): GoalTree => {
    const root = goalFactory.create({ level: 1 });
    // Recursive creation logic
    return buildTree(root, depth);
  },
};

export const userFactory = {
  create: (overrides?: Partial<User>): User => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: faker.helpers.arrayElement(['admin', 'user', 'viewer']),
    districtId: faker.string.uuid(),
    createdAt: faker.date.past(),
    ...overrides,
  }),
};
```

### Test Database Seeding

```typescript
// tests/utils/testDatabase.ts
export class TestDatabase {
  private supabase: SupabaseClient;
  
  async seed(scenario: 'minimal' | 'standard' | 'complex' = 'standard') {
    switch (scenario) {
      case 'minimal':
        await this.seedMinimal();
        break;
      case 'standard':
        await this.seedStandard();
        break;
      case 'complex':
        await this.seedComplex();
        break;
    }
  }
  
  private async seedStandard() {
    // Create districts
    const districts = await this.createDistricts(3);
    
    // Create users for each district
    for (const district of districts) {
      const users = await this.createUsers(5, { districtId: district.id });
      
      // Create goals for each user
      for (const user of users) {
        await this.createGoals(10, { userId: user.id, districtId: district.id });
      }
    }
    
    // Create sample metrics
    await this.createMetrics();
  }
  
  async cleanup() {
    await this.supabase.from('spb_goals').delete().neq('id', '');
    await this.supabase.from('spb_users').delete().neq('id', '');
    await this.supabase.from('spb_districts').delete().neq('id', '');
  }
}
```

---

## 🎯 Testing Best Practices

### Writing Effective Tests

#### 1. Follow AAA Pattern
```typescript
test('should calculate discount correctly', () => {
  // Arrange
  const originalPrice = 100;
  const discountPercentage = 20;
  
  // Act
  const discountedPrice = calculateDiscount(originalPrice, discountPercentage);
  
  // Assert
  expect(discountedPrice).toBe(80);
});
```

#### 2. Use Descriptive Test Names
```typescript
// ✅ GOOD
test('returns error message when email format is invalid');
test('disabled submit button when form has validation errors');
test('redirects to dashboard after successful login');

// ❌ BAD
test('test email');
test('form works');
test('login');
```

#### 3. Test User Behavior, Not Implementation
```typescript
// ✅ GOOD: Test what user sees/does
test('displays error when submitting empty form', async () => {
  render(<ContactForm />);
  
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(screen.getByText(/please fill in all required fields/i))
    .toBeInTheDocument();
});

// ❌ BAD: Testing implementation details
test('sets state.error to true on validation failure', () => {
  const component = shallow(<ContactForm />);
  component.instance().validate();
  expect(component.state('error')).toBe(true);
});
```

### Common Testing Patterns

#### Testing Async Operations
```typescript
test('loads and displays user data', async () => {
  const userData = { id: '1', name: 'John Doe' };
  server.use(
    rest.get('/api/user/:id', (req, res, ctx) => {
      return res(ctx.json(userData));
    })
  );
  
  render(<UserProfile userId="1" />);
  
  // Wait for loading to finish
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  
  // Check data is displayed
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

#### Testing Error States
```typescript
test('handles API errors gracefully', async () => {
  server.use(
    rest.get('/api/data', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ error: 'Server error' }));
    })
  );
  
  render(<DataDisplay />);
  
  await waitFor(() => {
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
  
  // Check retry button exists
  expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
});
```

---

## 📈 Coverage & Reporting

### Coverage Goals

| Type | Minimum | Target | Ideal |
|------|---------|--------|-------|
| Lines | 70% | 80% | 90% |
| Functions | 70% | 80% | 90% |
| Branches | 65% | 75% | 85% |
| Statements | 70% | 80% | 90% |

### Coverage Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch",
    "test:ci": "vitest run --coverage --reporter=json",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### Reporting Configuration

```typescript
// vitest.config.ts coverage section
coverage: {
  reporter: ['text', 'json', 'html', 'lcov'],
  reportsDirectory: './coverage',
  include: ['src/**/*.{ts,tsx}'],
  exclude: [
    'src/**/*.test.{ts,tsx}',
    'src/**/*.spec.{ts,tsx}',
    'src/**/*.types.ts',
    'src/test-utils/**',
  ],
  watermarks: {
    statements: [80, 95],
    functions: [80, 95],
    branches: [80, 95],
    lines: [80, 95],
  },
}
```

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          
  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🔍 Test Debugging

### Debug Strategies

```typescript
// Use screen.debug() to see current DOM
test('debugging example', () => {
  render(<MyComponent />);
  
  screen.debug(); // Prints entire DOM
  screen.debug(screen.getByRole('button')); // Prints specific element
});

// Use logRoles to understand accessibility tree
import { logRoles } from '@testing-library/react';

test('role debugging', () => {
  const { container } = render(<MyComponent />);
  logRoles(container);
});

// Use testing playground
screen.logTestingPlaygroundURL();
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Element not found | Use `screen.debug()`, check async rendering |
| Test timeout | Increase timeout, check for unresolved promises |
| Flaky tests | Use `waitFor`, avoid fixed delays |
| State not updating | Use `act()` wrapper for state updates |
| Mock not working | Check mock scope and setup order |

---

## 📋 Test Checklist

### Before Committing
- [ ] All tests pass locally
- [ ] Coverage meets minimum requirements
- [ ] No `.only()` or `.skip()` in tests
- [ ] Test names are descriptive
- [ ] No hardcoded test data
- [ ] Async operations properly handled
- [ ] Error cases tested
- [ ] Accessibility verified

### PR Review
- [ ] Tests cover new functionality
- [ ] Tests are maintainable
- [ ] No testing implementation details
- [ ] Proper use of testing utilities
- [ ] Appropriate test level (unit/integration/e2e)

---

*This testing strategy ensures high-quality, reliable code across all projects in the strategic-plan-workspace.*

*Last Updated: 2025-09-21*