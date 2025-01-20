# Disco Type System Documentation

## Core Types Overview

### User Types Hierarchy

1. **BaseUser** (`src/types/user.ts`)

   - Core user fields that are always required
   - Used as the foundation for all user-related types

   ```typescript
   interface BaseUser {
     id: string;
     email: string;
     firstName: string;
     lastName: string;
     emailVerified: boolean;
     createdAt: string | Date;
     updatedAt: string | Date;
     avatar?: string;
   }
   ```

2. **User** (`src/types/user.ts`)

   - Extends BaseUser with optional fields
   - Used for full user profiles and settings
   - Includes preferences, notifications, and safety settings

3. **ParticipantUser** (`src/types/participant.ts`)
   - Lightweight user representation for event contexts
   - Contains only essential user information
   - Used in event listings and participant lists

### Authentication Types

1. **NextAuth Extensions** (`src/types/auth.ts`)

   ```typescript
   // Session extension
   interface Session {
     user: {
       id: string;
       email: string;
       role: string;
       firstName: string;
     };
   }

   // User extension
   interface User {
     id: string;
     email: string;
     role: string;
     firstName: string;
     lastName: string;
   }

   // JWT extension
   interface JWT {
     id: string;
     email: string;
     role: string;
     firstName: string;
   }
   ```

2. **JWT Payload** (`src/types/auth.ts`)
   - Used for token generation and verification
   - Contains essential user identification and claims

### Event Types

1. **Event** (`src/types/event.ts`)

   - Base event type with core fields
   - Used for event listings and basic event information

2. **EventWithParticipants** (`src/types/event.ts`)

   - Extends Event with full participant information
   - Used when detailed participant data is needed

3. **EventParticipant** (`src/types/event.ts`)
   - Represents a user's participation in an event
   - Links users to events with status information

## File Organization

### Library Structure

```
src/
├── lib/
│   ├── auth/
│   │   ├── auth.config.ts   # NextAuth configuration
│   │   ├── auth.jwt.ts      # JWT utilities
│   │   └── types.ts         # Auth-specific types
│   ├── api/
│   │   ├── client.ts        # Base axios instance
│   │   ├── fetch.ts         # Fetch utilities
│   │   └── types.ts         # API types
│   ├── db/
│   │   ├── client.ts        # Prisma client
│   │   └── types.ts         # Database types
│   └── email/
│       ├── templates.ts     # Email templates
│       ├── sender.ts        # Email sending logic
│       └── types.ts         # Email types
└── services/
    ├── api/                 # API utilities
    ├── auth/                # Auth services
    ├── events/              # Event services
    └── users/               # User services
```

### Type Location Guidelines

1. **Shared Types**

   - Location: `src/types/`
   - Purpose: Types used across multiple modules
   - Examples: User, Event, Participant

2. **Module-Specific Types**

   - Location: `types.ts` within module directory
   - Purpose: Types specific to a module
   - Example: `src/lib/auth/types.ts`

3. **Service Types**
   - Location: Within service files
   - Purpose: Types specific to service implementation
   - Example: Service response types

## Type Usage Guidelines

### User Context

1. **Full User Profile**

   - Use the `User` type when you need complete user information
   - Includes all optional fields and preferences

   ```typescript
   import type { User } from '@/types/user';
   ```

2. **Event Participation**
   - Use `ParticipantUser` for event-related user information
   - Lighter weight, contains only essential fields
   ```typescript
   import type { ParticipantUser } from '@/types/participant';
   ```

### Authentication Context

1. **Session Handling**

   - Use NextAuth's extended Session type for auth contexts
   - Available through getServerSession()

   ```typescript
   import type { Session } from 'next-auth';
   ```

2. **Token Generation**
   - Use JWTPayload for token creation
   - Contains standard JWT claims plus custom fields

### Event Context

1. **Event Listings**

   - Use `Event` type for basic event information
   - Use `EventWithParticipants` when participant details are needed

2. **Participation Management**
   - Use `EventParticipant` for managing event participation
   - Includes status tracking and user reference

## Database Adapter Types

1. **Prisma Types**

   - Generated from schema
   - Located in `@prisma/client`
   - Used in database operations

2. **Type Mapping**
   ```typescript
   // Example: Mapping Prisma User to App User
   const mapDbUserToUser = (dbUser: PrismaUser): User => ({
     ...dbUser,
     preferences: dbUser.preferences as UserPreferences,
   });
   ```

## Best Practices

1. **Type Extensions**

   - Extend existing types instead of creating new ones
   - Use interfaces for better type composition

2. **Type Guards**

   - Use type guards to narrow types when needed
   - Implement validation functions for complex types

3. **Shared Types**

   - Keep shared types in dedicated files
   - Use barrel exports for convenient importing

4. **Type Safety**
   - Always use strict type checking
   - Avoid using 'any' type
   - Use type assertions sparingly

## Common Patterns

1. **Service Layer**

   ```typescript
   interface ServiceResponse<T> {
     data?: T;
     error?: string;
   }
   ```

2. **API Responses**

   ```typescript
   interface ApiResponse<T> {
     success: boolean;
     data?: T;
     error?: string;
   }
   ```

3. **Request Validation**
   ```typescript
   interface ValidationResult {
     valid: boolean;
     errors?: string[];
   }
   ```

## Type Generation

1. **Prisma**

   - Run `prisma generate` to update database types
   - Types are automatically generated from schema

2. **API Types**
   - Consider using tools like OpenAPI for API type generation
   - Maintain consistency between client and server types

## Future Considerations

1. **Type Evolution**

   - Plan for type versioning
   - Document breaking changes
   - Maintain backward compatibility

2. **Performance**
   - Monitor type bundle size
   - Use type-only imports where possible
   - Consider code splitting impact
