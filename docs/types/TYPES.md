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
