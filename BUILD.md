# Disco Build Guide

This guide covers common issues encountered during development and their solutions.

## Table of Contents

- [TypeScript Issues](#typescript-issues)
- [Authentication Issues](#authentication-issues)
- [Redis Issues](#redis-issues)
- [Route and API Issues](#route-and-api-issues)
- [Page Component Issues](#page-component-issues)

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

### 1. Authentication Errors

**Error:**

```
NOAUTH Authentication required
```

**Solution:**

- Add proper Redis configuration
- Handle null Redis client gracefully
- Add error handling for Redis operations

Example:

```typescript
const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
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
Cannot read property 'id' of undefined
```

**Solution:**

- Add proper parameter validation
- Use TypeScript path parameter types
- Add error handling for missing parameters

Example:

```typescript
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }
  // Handle request
}
```

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
```

## Common Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type checking
npm run type-check

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
