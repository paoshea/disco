# Disco Build Guide

This guide covers common issues encountered during development and their solutions.

## Table of Contents

- [TypeScript Issues](#typescript-issues)
- [Authentication Issues](#authentication-issues)
- [Redis Issues](#redis-issues)
- [Route and API Issues](#route-and-api-issues)
- [Page Component Issues](#page-component-issues)
- [Deployment Issues](#deployment-issues)

## TypeScript Issues

### 1. Null Safety Errors

**Error:**

```typescript
'value' is possibly 'null'
```

**Solution:**

- Use optional chaining: `value?.property`
- Add null checks: `if (value) { ... }`
- Use nullish coalescing: `value ?? defaultValue`
- Type guard: `if (typeof value === 'string') { ... }`

Example:

```typescript
// Before
const userName = user.name;

// After
const userName = user?.name ?? 'Anonymous';
```

### 2. Async Function Type Errors

**Error:**

```typescript
Async method has no 'await' expression
```

**Solution:**

- Remove `async` if no `await` is needed
- Add missing `await` for promises
- Change return type to match Promise type

Example:

```typescript
// Before
async function getData() {
  return 'data';
}

// After
function getData() {
  return 'data';
}
```

## Authentication Issues

### 1. Session Handling

**Error:**

```typescript
Cannot destructure property 'data' of 'useSession()' as it is undefined
```

**Solution:**

- Use status-based checks instead of direct destructuring
- Handle loading states
- Add proper session type definitions

Example:

```typescript
// Before
const { data: session } = useSession();

// After
const { status } = useSession();
if (status === 'loading') {
  return <LoadingComponent />;
}
```

### 2. NextAuth Configuration

**Error:**

```typescript
Type 'Session | null' is not assignable to type 'Session'
```

**Solution:**

- Update session callback to handle types correctly
- Ensure proper type definitions in auth.d.ts
- Never return null from session callback

Example:

```typescript
// Before
async session({ session, token }) {
  if (!session) return null;
  return session;
}

// After
session({ session, token }) {
  if (session?.user) {
    session.user.id = token.id;
    session.user.role = token.role;
  }
  return session;
}
```

## Redis Issues

### 1. Connection Errors

**Issue:**
Redis connection may show `NOAUTH Authentication required` or connection refused errors.

**Solution:**

1. Environment Configuration:

```bash
# Redis Configuration
REDIS_URL=redis://0.0.0.0:6379
REDIS_PASSWORD=  # Empty for non-auth mode
```

2. Redis Client Configuration:

```typescript
const redisConfig = {
  host: '0.0.0.0',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  ...(process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim() !== ''
    ? { password: process.env.REDIS_PASSWORD }
    : {}),
};
```

### 2. Redis Client Handling

**Error:**

```typescript
'redis' is possibly 'null'
```

**Solution:**

- Add null checks before Redis operations
- Provide fallback behavior
- Add try-catch blocks for Redis operations

Example:

```typescript
if (redis) {
  try {
    await redis.set(key, value);
  } catch (error) {
    console.error('Redis error:', error);
    // Fallback behavior
  }
}
```

## Middleware Issues

### 1. Next.js Root Middleware

**Location:**
The `middleware.ts` file must be in the root directory for Next.js to automatically detect and apply it. This handles all routing middleware logic before reaching application routes.

**Purpose:**

- Global route protection
- Authentication checks
- Request/response modification
- Route redirection

### 2. Service Middleware

**Location:**
The `src/middleware` folder contains modular middleware for services and API routes.

**Usage:**

- API route protection
- Request validation
- Response transformation
- Service-specific logic

Example:

```typescript
// Service middleware usage
import { withAuth } from '@/middleware/authMiddleware';

export const GET = withAuth(async req => {
  // Protected route logic
});
```

## Route and API Issues

### 1. API Route Type Safety

**Error:**

```typescript
Property 'json' does not exist on type 'Response'
```

**Solution:**

- Use proper Next.js API route types
- Add proper request/response typing
- Handle all HTTP methods explicitly

Example:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'Success' });
}
```

### 2. Dynamic Route Parameters

**Error:**

```typescript
Type error: Route has an invalid export: Type "{ params: { id: string; }; }" is not a valid type
```

**Solution:**

- In Next.js 15+, params must be wrapped in a Promise
- Define a proper RouteContext type for your dynamic route parameters
- Use the context parameter in your route handlers
- Await the params when accessing them

Example:

```typescript
// app/api/[id]/route.ts

// Define your route context type
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params;
  // Handle request
}

// Types are consistent across all HTTP methods
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params;
  // Same params structure
}
```

**Note:** In Next.js 15+, route parameters are provided as a Promise that must be awaited. This is different from earlier versions where params were directly accessible.

## Page Component Issues

### 1. Client Components

**Error:**

```
Error: useState is not defined
```

**Solution:**

- Add 'use client' directive
- Move client-side code to components
- Handle hydration properly

Example:

```typescript
'use client';

import { useState } from 'react';

export default function ClientComponent() {
  const [state, setState] = useState(null);
  // Component code
}
```

### 2. Data Fetching

**Error:**

```
Hydration failed because the initial UI does not match
```

**Solution:**

- Use proper loading states
- Handle server/client differences
- Add proper error boundaries

Example:

```typescript
export default function Page() {
  const { status, data } = useQuery('key', fetchData);

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'error') {
    return <ErrorComponent />;
  }

  return <DataDisplay data={data} />;
}
```

### 3. Authentication Hook Migration

**Issue:**
Pages using `useSession` from `next-auth/react` may encounter undefined errors during static generation or server-side rendering.

**Solution:**

- Replace `useSession` with custom `useAuth` hook
- Update component structure to handle loading and authentication states
- Ensure proper redirection for unauthenticated users

Example:

```typescript
// Before
const { status } = useSession();
const isLoading = status === 'loading';

// After
const { isLoading, user } = useAuth();
const router = useRouter();

React.useEffect(() => {
  if (!isLoading && !user) {
    router.push('/signin?callbackUrl=/current-page');
  }
}, [isLoading, user, router]);
```

**Affected Pages:**

- `/about`
- `/blog`
- `/careers`
- `/features`
- `/matching`
- `/privacy`
- `/security`
- `/terms`

### 4. Static Generation with Authentication

**Issue:**
Pages with authentication may fail during static generation due to missing session context.

**Solution:**

- Add proper loading states
- Handle null/undefined user states
- Use dynamic imports for authenticated content when necessary
- Implement proper client-side navigation

## Deployment Issues

### 1. Build Errors

**Error:**

```
Error: Cannot find module '@prisma/client'
```

**Solution:**

- Run Prisma generate before build
- Ensure Prisma client is properly installed
- Check database URL configuration

Example:

```typescript
// Update DATABASE_URL in .env
DATABASE_URL = 'postgresql://user:password@0.0.0.0:5432/disco';
```

### 2. WebSocket Connection Issues

**Error:**

```
WebSocket connection failed
```

**Solution:**

- Update WebSocket URL to use correct hostname
- Ensure proper SSL configuration
- Add error handling and reconnection logic

Example:

```typescript
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://0.0.0.0:4000';
```

### 3. Environment Variables

**Error:**

```
Error: Missing required environment variables
```

**Solution:**

- Verify all required environment variables are set
- Use proper deployment secrets management
- Add validation for required variables

Example:

```typescript
if (!process.env.NEXTAUTH_URL || !process.env.DATABASE_URL) {
  throw new Error('Missing required environment variables');
}
```

## Environment Setup

### Required Environment Variables

```bash
# Redis Configuration
LOCATION_REDIS_URL=localhost:6379
LOCATION_REDIS_PASSWORD=your_password
LOCATION_REDIS_USERNAME=default

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret

# Database Configuration
DATABASE_URL=your_database_url

# WebSocket Configuration
NEXT_PUBLIC_WEBSOCKET_URL=wss://api.disco.com/v1/ws
```

## Common Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type checking
npm run type-check

# ESLint fix
npm run lint -- --fix

# Format code with Prettier
npx prettier --write .

# Build for production
npm run build

# Start production server
npm start
```

Remember to always:

1. Check environment variables are properly set
2. Handle null/undefined cases
3. Add proper error handling
4. Use TypeScript strict mode
5. Test both development and production builds

## Best Practices

1. **Authentication:**

   - Use `useAuth` hook consistently across all authenticated pages
   - Always handle loading states
   - Implement proper redirection
   - Add appropriate error boundaries

2. **Redis:**

   - Never commit Redis passwords to version control
   - Use different configurations for development and production
   - Implement proper error handling
   - Monitor Redis connection status

3. **Build Process:**
   - Clear `.next` directory if encountering stale build issues
   - Ensure all required environment variables are set
   - Monitor build logs for authentication and connection errors
   - Use appropriate development/production configurations

## Common Development Commands

🔹 Run npm outdated first to check for available updates.

# Install dependencies

npm install

# Run development server

npm run dev

# Type checking

npm run type-check
tsc --noEmit

# ESLint fix

npm run lint -- --fix

# Format code with Prettier

npm run format
npx prettier --write .

# Clear Next.js cache

rm -rf .next/cache

# Complete clean build

rm -rf .next && npm run build

# Build for production

npm run build

# Start production server

npm start

Remember to:

1. Generate Prisma client before deployment
2. Set all required environment variables
3. Configure proper hostnames and ports
4. Enable proper error logging
5. Test WebSocket connections
6. Verify database connectivity
7. Test authentication flows