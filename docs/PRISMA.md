# Prisma Setup and Best Practices in Next.js

## Overview

This document outlines our Prisma setup, common patterns, and best practices for using Prisma with Next.js in the Disco application.

## Setup

### Installation

```bash
npm install @prisma/client
npm install prisma --save-dev
```

### Configuration

1. **Environment Variables**
   - Store database URL in `.env`:
     ```
     DATABASE_URL="your-database-url"
     ```
   - Add `.env` to `.gitignore`

2. **Schema Location**
   - Prisma schema is in `prisma/schema.prisma`
   - Run `npx prisma generate` after schema changes

### Client Setup

We use a singleton pattern to prevent multiple Prisma Client instances in development:

```typescript
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const db = global.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') global.prisma = db

export { db }
```

## Type Safety

### Model Types

1. **Direct Import**
   ```typescript
   import type { Event, Location, PrivacyZone } from '@prisma/client'
   ```

2. **Payload Types**
   ```typescript
   import { Prisma } from '@prisma/client'
   type EventWithRelations = Prisma.EventGetPayload<{
     include: { attendees: true }
   }>
   ```

### Client Extensions

When extending the Prisma Client:

1. Define return types explicitly
2. Use type assertions carefully with `as unknown as Type`
3. Add proper TypeScript generics to methods

## Common Patterns

### Error Handling

```typescript
try {
  const result = await db.event.create({
    data: eventData
  })
  return { success: true, data: result }
} catch (error) {
  console.error('Database error:', error)
  return { success: false, error: 'Failed to create event' }
}
```

### Transactions

```typescript
const [event, notification] = await db.$transaction([
  db.event.create({ data: eventData }),
  db.notification.create({ data: notificationData })
])
```

### Middleware

```typescript
db.$use(async (params, next) => {
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()
  console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
  return result
})
```

## Next.js Integration

### API Routes

```typescript
// pages/api/events.ts
import { db } from '@/lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const event = await db.event.create({
      data: req.body
    })
    res.status(201).json(event)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event' })
  }
}
```

### Server Components

```typescript
// app/events/page.tsx
import { db } from '@/lib/prisma'

export default async function EventsPage() {
  const events = await db.event.findMany()
  return <EventList events={events} />
}
```

## Performance Considerations

1. **Connection Pooling**
   - Use connection pooling in production
   - Configure max connections based on serverless function limits

2. **Query Optimization**
   - Use `select` and `include` judiciously
   - Implement pagination for large datasets
   - Use compound queries to reduce roundtrips

3. **Caching**
   - Implement caching for frequently accessed data
   - Use Next.js cache mechanisms appropriately

## Deployment

1. **Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

2. **Environment Variables**
   - Set `DATABASE_URL` in production environment
   - Use connection pooling URL if applicable

3. **Build Process**
   - Include Prisma generate in build script:
     ```json
     {
       "build": "prisma generate && next build"
     }
     ```

## Troubleshooting

### Common Issues

1. **Hot Reload Issues**
   - Use singleton pattern
   - Clear `node_modules/.prisma` if schema sync issues occur

2. **Type Generation**
   - Run `prisma generate` after schema changes
   - Ensure `@prisma/client` is up to date

3. **Performance Issues**
   - Check query plans
   - Monitor connection pool usage
   - Implement appropriate indexes

## Version Compatibility

| Dependency    | Version | Notes                                |
|--------------|---------|--------------------------------------|
| Next.js      | 13+     | Server Components support            |
| Prisma       | 6.2.1   | Latest with improved type inference  |
| TypeScript   | 5.0+    | Required for latest type features    |

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js with Prisma Guide](https://www.prisma.io/nextjs)
- [TypeScript Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)
