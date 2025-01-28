
# Types System Changes

## Current Issues
1. Duplicate safety-related types between schema and types files
2. Mix of old and new type versions without clear migration path
3. Inconsistent location type usage

## Proposed Changes

### 1. Consolidate Types
- Move runtime validation schemas to `src/schemas/safety.schema.ts`
- Keep type definitions in `src/types/safety.ts`
- Use type inference from schemas where possible

### 2. Type Organization
- Base types in `src/types/safety.ts`
- Schema validation in `src/schemas/safety.schema.ts`
- Infer types from schemas when used for validation

## File Changes Required

1. src/schemas/safety.schema.ts:
- Keep validation schemas only
- Use for runtime validation
- Export inferred types for use in application

2. src/types/safety.ts:
- Remove duplicate types
- Keep application-specific types
- Import schema-inferred types
