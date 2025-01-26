# Safety System Documentation

## Overview

The safety system in Disco provides real-time safety monitoring, emergency alerts, and safety checks for users. This document outlines the type system, common issues, and pending tasks for the safety platform.

## Type System

### Core Types

For type safety and database consistency, use Prisma's generated types instead of manually defining interfaces. Import these from @prisma/client:

```typescript
import { SafetyAlert, Location, User } from '@prisma/client';

// Example usage with Prisma types
type SafetyAlertResponse = SafetyAlert & {
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: Date;
  } | null;
  user: User;
};
```

This ensures:
- Type definitions stay in sync with your database schema
- Automatic updates when your schema changes
- Proper typing for all database operations
- Elimination of type mismatches between database and application

Legacy manual type (for reference only):
```typescript
interface SafetyAlertNew {
  id: string;
  userId: string;
  type: SafetyAlertType;
  status: 'active' | 'resolved' | 'dismissed';
  location: Location;
  message?: string;
  description?: string;
  evidence: SafetyEvidence[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}
```

#### Location

```typescript
interface Location {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
  privacyMode: 'precise' | 'approximate' | 'hidden';
  sharingEnabled: boolean;
}
```

#### SafetyCheckNew

```typescript
interface SafetyCheckNew {
  id: string;
  userId: string;
  type: 'meetup' | 'location' | 'custom';
  description: string;
  scheduledFor: string;
  status: 'pending' | 'completed' | 'missed';
  location?: Location;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### SafetyCenterProps

```typescript
interface SafetyCenterProps {
  safetySettings?: SafetySettingsNew;
  onSettingsChange?: (settings: Partial<SafetySettingsNew>) => void;
}
```

#### SafetyReport

```typescript
interface SafetyReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  type: 'harassment' | 'inappropriate' | 'spam' | 'scam' | 'other';
  description: string;
  evidence?: Array<{
    type: string;
    url: string;
  }>;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}
```

#### EmergencyContact

```typescript
interface EmergencyContact {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface EmergencyContactInput {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
}
```

#### Location Handling

```typescript
interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface StoredLocation {
  type: 'Point';
  coordinates: [number, number];
  accuracy?: number;
  timestamp: string;
}

import { LocationPrivacyMode } from '@/types/location';
interface Location {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
  privacyMode: LocationPrivacyMode;
  sharingEnabled: boolean;
}
```

When storing locations in Prisma:

```typescript
const locationJson = location
  ? {
      type: 'Point',
      coordinates: [location.latitude, location.longitude],
      accuracy: location.accuracy,
      timestamp: new Date().toISOString(),
    }
  : null;

await prisma.safetyCheck.create({
  data: {
    location: locationJson
      ? (locationJson as Prisma.InputJsonValue)
      : Prisma.JsonNull,
  },
});

const storedLocation = data.location as StoredLocation | null;
const location = storedLocation
  ? {
      id: generateId(),
      userId: data.userId,
      latitude: storedLocation.coordinates[0],
      longitude: storedLocation.coordinates[1],
      accuracy: storedLocation.accuracy,
      timestamp: new Date(storedLocation.timestamp),
      privacyMode: 'precise' as LocationPrivacyMode,
      sharingEnabled: true,
    }
  : undefined;
```

### JSON Serialization

When working with Prisma's JSON fields, we use intermediate types for serialization:

```typescript
interface LocationJson {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}
```

## Common Issues and Solutions

### 1. JSON Serialization with Prisma

**Issue**: Type mismatches between Prisma's JsonValue and our domain types.
**Solution**:

- Use intermediate JSON types (e.g., LocationJson)
- Convert Date objects to ISO strings before storing
- Convert ISO strings back to Date objects when retrieving
- Handle null values with Prisma.JsonNull
- Use proper Prisma.InputJsonValue for write operations

### 2. Prisma Model Field Mapping

**Issue**: Field name mismatches between Prisma models and TypeScript interfaces.
**Solution**:

```typescript
// Prisma Model
model Report {
  reporterId String
  reporter User
}

// Wrong TypeScript Usage
const report = await prisma.report.create({
  data: { userId: id }
});

// Correct TypeScript Usage
const report = await prisma.report.create({
  data: { reporterId: id }
});
```

### 3. Location Handling

**Issue**: Inconsistent location object creation and type safety.
**Solution**:

- Always include required Location properties
- Use proper null handling for optional fields
- Convert between Location and LocationJson appropriately

### 4. Promise Handling in React

**Issue**: Promise-returning functions in event handlers.
**Solution**:

```typescript
// Wrong
onClick={handleAsyncFunction}

// Correct
onClick={() => void handleAsyncFunction()}
```

### 5. React Hook Dependencies

**Issue**: Missing or unnecessary dependencies in useEffect/useCallback.
**Solution**:

- Use useCallback for functions used in dependencies
- Move functions inside useEffect if they're only used there
- Properly declare all dependencies

## Prisma Integration

### JSON Fields

When working with Prisma's JSON fields, use these type patterns:

```typescript
// For write operations (creating/updating)
evidence: data.evidence
  ? (data.evidence as Prisma.InputJsonValue)
  : Prisma.JsonNull;

// For read operations (retrieving)
evidence: jsonData as
  | Array<{
      type: string;
      url: string;
    }>
  | undefined;
```

### Enum Handling

```typescript
// Prisma enum
enum ReportStatus {
  pending
  reviewing
  resolved
  dismissed
}

// Converting to domain type
status: dbStatus.toLowerCase() as 'pending' | 'reviewing' | 'resolved' | 'dismissed'
```

## Best Practices

### 1. Type Safety

- Use Prisma's generated types from @prisma/client instead of manual interfaces
- Leverage Prisma's type system for database operations
- For custom types, extend Prisma's base types
- Handle JSON fields properly:
  - Use Prisma.JsonValue for read operations
  - Use Prisma.InputJsonValue for write operations
  - Use Prisma.JsonNull for null values
- Create type-safe response types by combining Prisma types:
  ```typescript
  type SafetyResponse = SafetyAlert & {
    user: Pick<User, 'id' | 'name'>;
    location: Location | null;
  };
  ```

## Pending Tasks

### 1. Safety Settings Implementation

- [ ] Define proper SafetySettings type
- [ ] Implement settings update in safety.service.ts
  - Currently commented out with temporary implementation
  - Need to restore and implement:
    ```typescript
    const safetySettings: Partial<SafetySettingsNew> = {
      ...settings,
      emergencyContacts: transformedContacts,
    };
    ```
- [ ] Add validation schema for settings
- [ ] Update API route to handle settings properly
- [ ] Implement proper error handling for settings updates
- [ ] Add settings migration strategy for existing users
- [ ] Create settings management UI
- [ ] Add settings sync across devices

### 2. Location Privacy

- [ ] Implement privacy zones
- [ ] Add location fuzzing for approximate mode
- [ ] Add privacy mode transitions
- [ ] Implement location sharing controls

### 3. Emergency Contacts

- [ ] Implement contact verification
- [ ] Add notification preferences
- [ ] Create contact management UI

### 4. Evidence Collection

- [ ] Define evidence types (photo, audio, video)
- [ ] Implement secure upload
- [ ] Add metadata handling
- [ ] Create evidence review system

### 5. Safety Check System

- [ ] Implement recurring checks
- [ ] Add check templates
- [ ] Create notification system
- [ ] Add escalation procedures

## Best Practices

### 1. Type Safety

- Always use strict types, avoid `any`
- Use type assertions with runtime checks
- Define proper interfaces for all data structures
- Ensure TypeScript interfaces match Prisma models
- Use proper Prisma types for JSON fields:
  - InputJsonValue for write operations
  - JsonValue for read operations
  - JsonNull for null values

### 2. Error Handling

- Use proper error types
- Provide meaningful error messages
- Handle edge cases gracefully

### 3. State Management

- Use proper React state management
- Handle loading and error states
- Implement proper cleanup

### 4. API Design

- Use proper HTTP methods
- Implement proper validation
- Handle rate limiting
- Add proper error responses

## Migration Guide

### Converting from Old Types

If you encounter old type formats, use these conversion patterns:

```typescript
// Old format
interface OldSafetyAlert {
  dismissed: boolean;
  resolved: boolean;
  // ...
}

// New format
interface SafetyAlertNew {
  status: 'active' | 'resolved' | 'dismissed';
  // ...
}

// Conversion
const convertOldToNew = (old: OldSafetyAlert): SafetyAlertNew => ({
  status: old.dismissed ? 'dismissed' : old.resolved ? 'resolved' : 'active',
  // ...
});
```

## Testing

### Unit Tests Needed

- [ ] Location conversion functions
- [ ] Alert status transitions
- [ ] Safety check scheduling
- [ ] Privacy mode transitions

### Integration Tests Needed

- [ ] Emergency alert flow
- [ ] Safety check completion
- [ ] Contact notification
- [ ] Location tracking

## Performance Considerations

### Location Updates

- Implement proper throttling
- Use appropriate accuracy levels
- Handle background updates efficiently

### Real-time Updates

- Implement proper WebSocket handling
- Add proper connection recovery
- Handle offline mode gracefully

## Security Considerations

### Location Data

- Implement proper encryption
- Add access controls
- Handle privacy zones properly
- Implement data retention policies

### Emergency Contacts

- Verify contact information
- Implement proper authentication
- Add rate limiting for notifications
- Handle permission revocation