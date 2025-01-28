# Safety System Type Architecture

## Overview

The safety system uses a dual-type approach for maximum type safety and runtime validation:

1. **Runtime Validation** (`src/schemas/safety.schema.ts`)

- Handles API request/response validation
- Uses Zod for runtime type checking
- Defines validation rules and constraints

2. **TypeScript Types** (`src/types/safety.ts`)

- Provides compile-time type checking
- Contains React component prop types
- Defines application-specific types

## Type Structure

### Validation Schemas (`safety.schema.ts`)

```typescript
import { z } from 'zod';

// Core validation schemas
const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
  timestamp: z.date(),
  privacyMode: z.enum(['precise', 'approximate', 'hidden']),
  sharingEnabled: z.boolean(),
});

const SafetyAlertSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(), // Add specific alert types here
  status: z.enum(['active', 'resolved', 'dismissed']),
  location: LocationSchema.optional(),
  message: z.string().optional(),
  description: z.string().optional(),
  evidence: z.array(z.object({ type: z.string(), url: z.string() })),
  createdAt: z.date(),
  updatedAt: z.date(),
  resolvedAt: z.date().optional(),
});

const SafetyCheckSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['meetup', 'location', 'custom']),
  description: z.string(),
  scheduledFor: z.date(),
  status: z.enum(['pending', 'completed', 'missed']),
  location: LocationSchema.optional(),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const SafetySettingsSchema = z.object({
  // Define your safety settings schema here
});

const EmergencyContactSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export {
  LocationSchema,
  SafetyAlertSchema,
  SafetyCheckSchema,
  SafetySettingsSchema,
  EmergencyContactSchema,
};
```

### Application Types (`safety.ts`)

```typescript
// Component prop types
interface SafetyCenterProps {
  userId: string;
  safetySettings: SafetySettings;
  onSettingsChange?: (settings: Partial<SafetySettings>) => void;
}

// Application-specific types
interface SafetyAlertContextType {
  alerts: SafetyAlert[];
  loading: boolean;
  error: string | null;
}

interface SafetySettings {
  // Define your safety settings types here.
}

interface SafetyAlert {
  // Define your safety alert types here.  Potentially extend from a type inferred from SafetyAlertSchema
}
```

## Best Practices

1. **Schema Usage**

- Use Zod schemas for API endpoints
- Validate incoming data at runtime
- Export inferred types when needed

2. **Type Usage**

- Use TypeScript types for components
- Keep application logic types separate
- Extend schema types when needed

3. **Type Safety**

- Prefer schema validation for external data
- Use TypeScript types for internal logic
- Maintain separation of concerns

## Common Patterns

### API Validation

```typescript
// Endpoint validation
import { Request, Response } from 'express'; // Assuming express.js
import { SafetyAlertSchema } from './safety.schema';

const createSafetyAlert = async (req: Request, res: Response) => {
  const result = SafetyAlertSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors });
  }
  const newAlert = await prisma.safetyAlert.create({ data: result.data });
  res.status(201).json(newAlert);
};
```

### Component Types

```typescript
// Component with proper typing
import React from 'react';
import { SafetyAlert } from './safety'; // Import from safety.ts

interface SafetyAlertProps {
  alert: SafetyAlert;
  onDismiss: () => void;
}

const SafetyAlertComponent: React.FC<SafetyAlertProps> = ({
  alert,
  onDismiss
}) => {
  return (
    <div>
      {/* Display alert details */}
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  );
};
```

## Architecture Decision

The separation between schemas and types is intentional and provides:

- Clear boundaries between validation and typing
- Independent evolution of validation rules
- Better type safety for components
- Cleaner codebase organization

This dual approach should be maintained for optimal type safety and runtime validation.
