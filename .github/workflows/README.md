# CI/CD Workflows

This directory contains GitHub Actions workflows for the Strategic Plan Workspace.

## Current Workflows

### CI (`ci.yml`)

Runs on all pull requests and pushes to `main`.

**Checks Performed:**
1. ✅ **Build Check** - Ensures Vite build succeeds (required)
2. ⚠️ **Lint Check** - ESLint code quality (warning only)
3. ⚠️ **TypeScript Check** - Type validation (warning only)
4. ⚠️ **Tests** - Vitest unit tests (warning only)
5. ⚠️ **Security Audit** - npm audit for vulnerabilities (warning only)

**Production Build:**
- Runs only on pushes to `main`
- Uploads build artifacts for 7 days
- Useful for deployment verification

## Status

**Current State:**
- ✅ Build check is enforced
- ⚠️ Other checks are informational (won't block PRs)

**Future Improvements:**
1. Fix TypeScript errors and make type check required
2. Add test coverage requirements
3. Make linting required after cleanup
4. Add E2E testing with Playwright
5. Add deployment workflow

## Local Testing

Test CI checks locally before pushing:

```bash
cd strategic-plan-vite

# Build check (required)
npm run build

# Lint check
npm run lint

# TypeScript check
npx tsc --noEmit

# Run tests
npm run test -- --run

# Security audit
npm audit --audit-level=moderate
```

## Why Some Checks Are Optional

Currently, some checks are set to `continue-on-error: true` because:
- TypeScript has existing type errors to be fixed
- Tests need to be updated for new components
- Linting rules need to be configured

These will be made required as the codebase is cleaned up.
