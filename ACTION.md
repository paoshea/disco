# Disco Codebase Reorganization Action Plan

## Objective

Reorganize the Disco codebase to improve maintainability, reduce duplication, and clarify frontend/backend separation while preserving Next.js conventions.

## Pre-Migration Checklist

- [ ] Create git branch: `refactor/codebase-reorganization`
- [ ] Take snapshot of current test coverage
- [ ] Document current build time metrics
- [ ] Verify all tests pass in current state

## 1. File Migrations

### Hooks Migration

- [ ] Move `app/hooks/useAuth.ts` → `src/hooks/useAuth.ts`
  - [ ] Update imports in all files using useAuth
  - [ ] Test auth functionality after move
  - [ ] Remove empty app/hooks directory

### Auth Service Reorganization

- [ ] Create `src/services/auth` directory
- [ ] Move `src/services/api/auth.service.ts` → `src/services/auth/auth.service.ts`
  - [ ] Update service imports
  - [ ] Test all auth endpoints
  - [ ] Verify JWT token handling

### API Client Restructuring

- [ ] Create `src/lib/api` directory
- [ ] Move `src/services/api/api.client.ts` → `src/lib/api/client.ts`
  - [ ] Update all API client imports
  - [ ] Test API connectivity
  - [ ] Verify error handling

### Dashboard Components

- [ ] Create `src/components/dashboard` directory
- [ ] Move from `app/dashboard/components/` to `src/components/dashboard/`:
  - [ ] `DashboardHeader.tsx`
  - [ ] `DashboardStats.tsx`
- [ ] Update dashboard page imports
- [ ] Test dashboard rendering

## 2. Import Path Updates

- [ ] Update tsconfig.json paths if needed
- [ ] Run search for all affected imports
- [ ] Update import statements in:
  - [ ] Components
  - [ ] Pages
  - [ ] API routes
  - [ ] Tests
- [ ] Run TypeScript compiler to catch any missed imports

## 3. Testing Strategy

- [ ] Unit Tests
  - [ ] Verify all component tests pass
  - [ ] Update test import paths
  - [ ] Add tests for any untested code paths
- [ ] Integration Tests
  - [ ] Test auth flow end-to-end
  - [ ] Test API endpoints
  - [ ] Test dashboard functionality
- [ ] E2E Tests
  - [ ] Run full Cypress/Playwright suite
  - [ ] Verify critical user journeys

## 4. Verification Steps

- [ ] Build Verification
  - [ ] Run `npm run build`
  - [ ] Verify no build errors
  - [ ] Compare build size metrics
- [ ] Runtime Verification
  - [ ] Start development server
  - [ ] Test all major features
  - [ ] Verify hot reload works
- [ ] Type Checking
  - [ ] Run `tsc --noEmit`
  - [ ] Fix any type errors

## 5. Documentation Updates

- [ ] Update README.md with new file structure
- [ ] Document any changed import patterns
- [ ] Update API documentation if needed
- [ ] Update contribution guidelines

## 6. Performance Validation

- [ ] Compare build times
- [ ] Run lighthouse scores
- [ ] Check bundle sizes
- [ ] Verify no regression in:
  - [ ] First Load JS
  - [ ] First Contentful Paint
  - [ ] Time to Interactive

## 7. Clean Up

- [ ] Remove any empty directories
- [ ] Delete unused files
- [ ] Clean up any duplicate types
- [ ] Remove unused imports
- [ ] Format all modified files

## Success Criteria

- [ ] All tests passing
- [ ] Build succeeding
- [ ] No TypeScript errors
- [ ] No runtime errors
- [ ] No performance regression
- [ ] Improved code organization
- [ ] Clear separation of concerns
- [ ] Maintainable file structure

## Rollback Plan

1. Create a backup branch before starting
2. Document all changed files
3. Prepare rollback commands
4. Test rollback procedure

## Notes

- Keep Next.js routing structure intact
- Maintain backwards compatibility
- Follow atomic commits
- Update PR with before/after metrics
