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

### Location and Places Types

1. **Place** (`src/components/chat/PlaceSuggestions.tsx`)

   ```typescript
   interface Place {
     id: string;
     name: string;
     address: string;
     category: string;
     rating: number;
     priceLevel: number;
     position: {
       lat: number;
       lng: number;
     };
   }
   ```

2. **GooglePlaceType** (`src/components/chat/PlaceSuggestions.tsx`)

   ```typescript
   type GooglePlaceType = 'cafe' | 'restaurant' | 'bar' | 'establishment';
   ```

3. **PlaceCategory** (`src/components/chat/PlaceSuggestions.tsx`)
   ```typescript
   type PlaceCategory = {
     id: GooglePlaceType;
     label: string;
     icon: React.ElementType;
   };
   ```

### Component Types

1. **Component Props** (`src/components/types/props.ts`)

   ```typescript
   interface ComponentProps {
     children: React.ReactNode;
     className?: string;
     style?: React.CSSProperties;
   }
   ```

2. **Component States** (`src/components/types/states.ts`)

   ```typescript
   interface ComponentState {
     loading: boolean;
     error?: string;
     data?: any;
   }
   ```

### Next.js App Router Route Handler Types

1. **Route Handler Context** (`app/api/**/route.ts`)

   - Used for Next.js 15.x App Router route handlers
   - Provides type-safe access to dynamic route parameters
   - Route params are handled as Promises to support async operations during route resolution

   ```typescript
   // Route handler parameter type
   type RouteContext = {
     params: Promise<{
       [key: string]: string; // Dynamic route parameters (e.g., id, roomId)
     }>;
   };

   // Example usage in route handler
   export async function GET(
     request: NextRequest,
     context: RouteContext
   ): Promise<NextResponse> {
     const params = await context.params;
     const { id } = params; // Access dynamic route parameter
     // ... rest of the handler
   }
   ```

2. **Example Usage**

   ```typescript
   // Dynamic route: app/api/chats/rooms/[roomId]/messages/route.ts
   export async function GET(
     request: NextRequest,
     context: RouteContext
   ): Promise<NextResponse> {
     const params = await context.params;
     const roomId = params.roomId; // Type-safe access to roomId
     // ... rest of handler code
   }
   ```

3. **Configuration Options**

   ```typescript
   // Next.js 15.x specific configurations
   export const dynamic = 'force-dynamic'; // Disable static optimization
   export const runtime = 'nodejs'; // Use Node.js runtime
   export const revalidate = 0; // Disable caching
   ```

4. **Best Practices**
   - Use `Record<string, string>` for params type to match Next.js internal types
   - Access params through context.params
   - Include proper return types (NextResponse)
   - Add appropriate configuration exports based on route requirements

## Type System Overview & Best Practices

### Key Design Principles

1. **Version Management**

   - Multiple types have "Old" and "New" versions (e.g., SafetySettingsOld → SafetySettingsNew)
   - This indicates an ongoing migration that needs careful handling
   - Always use "New" versions in new code, "Old" versions maintained for legacy API compatibility

2. **Response Wrapping**

   ```typescript
   interface ApiResponse<T> {
     data: T;
     status: number;
     message?: string;
   }
   ```

   - All API responses are wrapped in an ApiResponse<T> structure
   - Requires careful type handling in services to access nested data
   - Example usage:
     ```typescript
     const response =
       await apiClient.get<ApiResponse<{ matches: Match[] }>>('/matches');
     return response.data.matches;
     ```

3. **Cross-Domain Types**

   - Location type is used across multiple domains (safety, matches, events)
   - User type is referenced by many features
   - These shared types need careful coordination when making changes

4. **Status Management**

   - Multiple status enums exist for different features
   - Some overlap in status names but with different meanings
   - Need to be careful not to mix up similar-sounding statuses

5. **Optional Fields**

   - Many types use optional fields extensively
   - Requires careful null/undefined handling in the code
   - Example:
     ```typescript
     onSettingsChange: (settings: Partial<SafetySettingsNew>) => void;
     ```

6. **External API Integration**

   - When working with external APIs (e.g., Google Places), prefer using string literal types
   - Map external API types to internal types for better type safety
   - Example:

     ```typescript
     // Instead of using the API's type directly
     type: google.maps.places.PlaceType;

     // Define our own type that matches the API
     type GooglePlaceType = 'cafe' | 'restaurant' | 'bar' | 'establishment';
     ```

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

   TO BE MERGED

   # Disco Type System Documentation

This document provides a comprehensive overview of the type system used in the Disco application, highlighting important relationships, versioning, and special features.
To avoid potential gotchas, the type system is carefully designed to ensure consistency and maintainability. Below are some key points:

- Version Management:
  Multiple types have "Old" and "New" versions (e.g., SafetySettingsOld → SafetySettingsNew)
  This indicates an ongoing migration that needs careful handling
- Response Wrapping:
  All API responses are wrapped in an ApiResponse<T> structure
  This requires careful type handling in services to access nested data
- Cross-Domain Types:
  Location type is used across multiple domains (safety, matches, events)
  User type is referenced by many features
  These shared types need careful coordination when making changes
- Status Management:
  Multiple status enums exist for different features
  Some overlap in status names but with different meanings
  Need to be careful not to mix up similar-sounding statuses
- Optional Fields:
  Many types use optional fields extensively
  Requires careful null/undefined handling in the code

## API Response Structure

All API responses follow a consistent structure:

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}
```

When making API calls, always wrap the expected response type in this structure:

```typescript
// Example API call
const response = await apiClient.get<{ data: { matches: Match[] } }>(
  '/matches'
);
return response.data.data.matches;
```

## Authentication Types

Authentication types are crucial for maintaining type safety across the application:

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
  };
}

interface LoginResult {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthResult {
  userId: string;
  error?: never;
  status?: never;
} | {
  error: string;
  status: number;
  userId?: never;
}
```

Always use discriminated unions (like AuthResult) for handling success/error cases.

## Type Versioning

Several types have both "Old" and "New" versions to support backward compatibility during migration:

### Safety Types

- `SafetySettingsOld` → `SafetySettingsNew`
- `SafetyAlertOld` → `SafetyAlertNew`
- `SafetyCheckOld` → `SafetyCheckNew`
- `SafetyReportOld` → `SafetyReportNew`

Always use the "New" versions in new code. The "Old" versions are maintained for legacy API compatibility.

## Key Type Relationships

### Location

The `Location` type is used across multiple domains:

- Safety alerts and checks
- User profiles
- Events
- Matches

### User

The `User` type is a core entity referenced by:

- Safety alerts and reports
- Matches
- Chat rooms
- Events

## Status Enums

Several features use status enums to track their state:

### Safety

```typescript
type SafetyAlertStatus = 'pending' | 'active' | 'resolved' | 'dismissed';
type SafetyCheckStatus = 'pending' | 'safe' | 'unsafe' | 'missed';
type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
```

### Matching

```typescript
type MatchStatus = 'pending' | 'accepted' | 'declined' | 'blocked';
```

## Props Interfaces

Component prop interfaces follow a consistent naming pattern:

```typescript
interface ComponentNameProps {
  // Props specific to the component
}
```

Example:

```typescript
interface SafetyFeaturesProps {
  user: User;
  settings: SafetySettingsNew;
  onSettingsChange: (settings: Partial<SafetySettingsNew>) => void;
}
```

## Prisma Types and Model Names

### Model Names in Prisma Client

Prisma models defined in `schema.prisma` are accessible through the Prisma client using lowercase model names:

```typescript
// In schema.prisma
model Location {
  id String @id
  // ...
}

// In your code
db.location.findFirst()  // Correct
db.Location.findFirst() // Wrong
```

### Type Assertions with Application Types

When using Prisma client results with application-specific types, use type assertions:

```typescript
// Application type
interface Location {
  id: string;
  latitude: number;
  longitude: number;
  // ...
}

// Using with Prisma
const location = (await db.location.findFirst()) as Location;
```

### Analyzing Prisma Client Types

To debug Prisma client type issues, use these commands:

```bash
# Regenerate Prisma client
npx prisma generate

# View Prisma schema
cat node_modules/.prisma/client/schema.prisma

# Check Prisma client types
ls node_modules/@prisma/client
ls node_modules/.prisma/client

# View type definitions
cat node_modules/@prisma/client/index.d.ts
```

### Prisma Client Configuration

Enable logging in development to help debug type issues:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## Prisma Client Organization Patterns

There are two recommended patterns for organizing Prisma client usage:

1. **Service Class Pattern**

   ```typescript
   class LocationService {
     private prisma: PrismaClient['location'];

     constructor() {
       this.prisma = db.location;
     }

     async findLocation() {
       return await this.prisma.findFirst();
     }
   }
   ```

2. **Module-Level Client Pattern**

   ```typescript
   const locationDb = db.location;
   const privacyZoneDb = db.privacyZone;

   export async function findLocation() {
     return await locationDb.findFirst();
   }
   ```

Benefits of these patterns:

- Type-safe access to Prisma models
- Better code organization and reusability
- Reduced repetition of `db.modelName`
- Easier to mock for testing

### Type Inference vs Type Assertion

When working with Prisma:

1. **Type Inference (Preferred)**

   ```typescript
   // Prisma will infer the correct type
   const location = await db.location.findFirst();
   ```

2. **Type Assertion (When needed)**
   ```typescript
   // Use when mixing with application types
   const location = (await db.location.findFirst()) as Location;
   ```

Always prefer type inference unless you need to convert to application-specific types.

## Prisma Client Type Access

When working with Prisma models in TypeScript, there are several ways to type your database access:

```typescript
// Option 1: Direct access with PrismaClient type
private prisma: PrismaClient['$extends']['extArgs']['model']['location'];

// Option 2: Using NonNullable to ensure type exists
private prisma: NonNullable<PrismaClient['$extends']>['location'];

// Option 3: Type casting with 'any' (avoid if possible)
this.prisma = (db as any).location;
```

Choose the approach that best fits your needs:

- Option 1 is most type-safe but may need updates with Prisma version changes
- Option 2 provides good type safety while being more flexible
- Option 3 should be used only as a last resort

## Prisma Client Type Casting Pattern

When working with Prisma models in TypeScript, use the following type casting pattern:

```typescript
// INCORRECT: This can lead to type errors with Prisma's generated types
private prisma: PrismaClient['$extends']['extArgs']['model']['location'];
this.prisma = (db as PrismaClient).location;

// INCORRECT: Direct access can fail type checking
const locationDb = db.location;

// CORRECT: Use NonNullable with a localized any cast
const locationDb: NonNullable<PrismaClient['location']> = (db as any).location;
```

The correct pattern has these key elements:

1. Type the variable using `NonNullable<PrismaClient['modelName']>`
2. Use a localized `any` cast only during initialization: `(db as any).modelName`
3. Keep the type assertion scoped only to the assignment

This pattern works because:

- `NonNullable` ensures type safety after initialization
- The localized `any` cast handles Prisma's internal type complexity
- The pattern is consistent with Prisma's runtime behavior

## Troubleshooting Prisma Type Issues

### Common Issue: Property Does Not Exist on PrismaClient

When accessing Prisma models, you might encounter errors like:

```typescript
Property 'modelName' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'
```

Here are the attempted solutions and their outcomes:

#### Attempt 1: Direct Type Assertion (Not Recommended)

```typescript
// ❌ Does not work - loses type safety
const modelDb = (db as any).modelName;
```

#### Attempt 2: Using NonNullable with PrismaClient (Partial Solution)

```typescript
// ⚠️ Works but with type errors
const modelDb: NonNullable<PrismaClient['modelName']> = (db as any).modelName;
```

#### Attempt 3: Using Prisma's Delegate Types (Not Working)

```typescript
// ❌ Type errors persist
const modelDb: Prisma.ModelDelegate<
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation
> = db.modelName;
```

#### Solution: Custom Extended PrismaClient Type

The working solution involves creating a custom type in your Prisma configuration file:

1. First, verify your schema and regenerate the client:

```bash
npx prisma validate
npx prisma generate
```

2. Create an extended PrismaClient type in `lib/prisma.ts`:

```typescript
export type ExtendedPrismaClient = PrismaClient & {
  $extends: {
    model: {
      modelName: {
        findFirst: (args: any) => Promise<any>;
        findMany: (args: any) => Promise<any>;
        create: (args: any) => Promise<any>;
        deleteMany: (args: any) => Promise<any>;
      };
      // Add other models as needed
    };
  };
};
```

3. Use the extended type in your services:

```typescript
import type { ExtendedPrismaClient } from '@/lib/prisma';

class ModelService {
  private prisma: ExtendedPrismaClient['$extends']['model']['modelName'];

  constructor() {
    this.prisma = (db as ExtendedPrismaClient).$extends.model.modelName;
  }
}
```

This solution works because:

- It properly types the extended Prisma client
- Maintains type safety for model operations
- Allows TypeScript to understand the model structure
- Works consistently across different parts of the application

### Best Practices

1. Always regenerate Prisma client after schema changes:

```bash
npx prisma generate
```

2. Verify schema validity:

```bash
npx prisma validate
```

3. Use the ExtendedPrismaClient type for all Prisma model access
4. Keep model method signatures up to date in the extended type
5. Consider adding specific argument and return types for better type safety

### Common Gotchas

- Make sure your schema.prisma file is properly defined
- Ensure all models referenced in the ExtendedPrismaClient exist in your schema
- The extended type needs to match your actual Prisma model methods
- Remember to update the extended type when adding new model operations

## Next.js Route Handler Types

### Dynamic Route Parameters

When working with Next.js dynamic route handlers (e.g., `app/api/[id]/route.ts`), the correct type for the params argument is:

```typescript
{
  params: Promise<{ [key: string]: string }>;
}
```

Example usage:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response>;
```

This is because:

1. Next.js 15 expects route parameters to be wrapped in a Promise
2. The params object contains key-value pairs where both key and value are strings
3. Custom interfaces like `RouteHandlerContext` are not compatible with Next.js's internal types

❌ Incorrect:

```typescript
interface RouteHandlerContext {
  params: { id: string };
}

export async function GET(request: NextRequest, context: RouteHandlerContext);
```

✅ Correct:

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
);

// Usage
const { id } = await params;
```

## Type Mapping Between Components

When different parts of your application use different types for the same concept, create explicit mappings:

```typescript
// Example: Mapping between app and API privacy modes
const privacyMode = userMode === 'precise' ? 'standard' : 'strict';

// Better: Create a type-safe mapping function
function mapPrivacyMode(mode: LocationPrivacyMode): ApiPrivacyMode {
  const mapping: Record<LocationPrivacyMode, ApiPrivacyMode> = {
    precise: 'standard',
    approximate: 'strict',
    zone: 'strict',
  };
  return mapping[mode];
}
```

## Nested Object Type Access

When working with complex types that have nested objects, use optional chaining and proper type narrowing:

```typescript
// Bad: Direct access to nested properties
event.latitude.toFixed(6);

// Good: Access through nested object with optional chaining
event.location.latitude?.toFixed(6);

// Better: Add type guard for complete type safety
function hasCoordinates(
  location: Location
): location is Location & { latitude: number; longitude: number } {
  return (
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number'
  );
}

if (hasCoordinates(event.location)) {
  console.log(event.location.latitude.toFixed(6));
}
```

## Component Props Type Safety

When defining component props:

1. Use explicit interfaces for prop types:

```typescript
interface LocationPrivacyProps {
  onPrivacyChange: (mode: LocationPrivacyMode) => void;
  onSharingChange: (enabled: boolean) => void;
}
```

2. Ensure all required callbacks are properly typed:

```typescript
<MatchList
  matches={matches}
  onMatchClick={(matchId: string) => void}
/>
```

3. Use discriminated unions for components with different modes:

```typescript
type ViewMode = 'list' | 'map';
type ViewProps = {
  mode: ViewMode;
  data: Match[];
} & (
  | { mode: 'list'; onItemClick: (id: string) => void }
  | { mode: 'map'; onMarkerClick: (id: string) => void }
);
```

## Type Safety Best Practices

1. **Request Body Typing**: Always type your request bodies explicitly:

   ```typescript
   interface MessageContent {
     content: string;
   }
   const body = (await request.json()) as MessageContent;
   ```

2. **Error Handling**: Use discriminated unions for error handling:

   ```typescript
   if ('error' in result) {
     // Handle error case
   } else {
     // Handle success case
   }
   ```

3. **Authentication**: Always properly type authentication results:

   ```typescript
   const session = await verifyToken(token);
   if (!session) {
     return { error: 'Invalid token', status: 401 };
   }
   return { userId: session.user.id };
   ```

4. **API Responses**: Consistently type API responses:
   ```typescript
   return NextResponse.json<ApiResponse<T>>(data);
   ```

## Important Notes

1. **Partial Updates**: Many update operations use `Partial<T>` to allow updating only specific fields:

   ```typescript
   onSettingsChange: (settings: Partial<SafetySettingsNew>) => void;
   ```

2. **Date Handling**: Dates are consistently stored as ISO strings:

   ```typescript
   createdAt: string;
   updatedAt: string;
   resolvedAt?: string;
   ```

3. **Optional Fields**: Fields that may not always be present are marked with `?`:

   ```typescript
   location?: Location;
   description?: string;
   ```

4. **Nested Objects**: Some types contain nested objects that should be handled carefully:
   ```typescript
   notifyOn: {
     sosAlert: boolean;
     meetupStart: boolean;
     meetupEnd: boolean;
   }
   ```

## Best Practices

1. Always use the most specific type possible
2. Use "New" versions of types for new code
3. Handle optional fields appropriately
4. Use discriminated unions for error handling
5. Explicitly type request bodies
6. Use type guards for complex type checking
7. Use the `ApiResponse` wrapper when making API calls
8. Use `Partial<T>` for update operations
9. Follow the established naming conventions for new types
10. Never use `any` - always provide proper types
