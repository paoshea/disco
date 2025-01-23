# Match Service Documentation

## Overview
The Match Service is a core component of Disco that handles user matching, preferences, and scoring. It follows a layered architecture pattern with clear separation of concerns.

## Architecture

```
src/services/match/
├── match.service.ts   # Main service coordinator
├── match.api.ts       # API client for external requests
├── match.db.ts        # Database operations using Prisma
└── match.algorithm.ts # Match scoring algorithms
```

## Database Layer

### Prisma Schema
The database layer uses Prisma with the following key models:

```prisma
model User {
  // Basic fields
  id                   String    @id @default(cuid())
  name                 String?
  email                String    @unique
  // ... other fields

  // Match-related fields
  preferences          UserPreferences?
  matches              UserMatch[]      @relation("UserMatches")
  matchedBy            UserMatch[]      @relation("MatchedUsers")
}

model UserPreferences {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id])
  maxDistance           Int      @default(50)
  ageRange             Json     // { min: number, max: number }
  activityTypes        String[] @default([])
  availability         String[] @default([])
  gender               String[] @default([])
  lookingFor           String[] @default([])
  relationshipType     String[] @default([])
  verifiedOnly         Boolean  @default(false)
  withPhoto            Boolean  @default(true)
  privacyMode          String   @default("public")
  timeWindow           String   @default("anytime")
  useBluetoothProximity Boolean @default(false)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@map("user_preferences")
  @@index([userId])
}

model UserMatch {
  id            String   @id @default(cuid())
  userId        String
  matchedUserId String
  status        String   // "pending", "accepted", "rejected", "blocked"
  score         Float
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  reportReason  String?  // Reason if match is reported
  
  user          User     @relation("UserMatches", fields: [userId], references: [id])
  matchedUser   User     @relation("MatchedUsers", fields: [matchedUserId], references: [id])

  @@index([userId])
  @@index([matchedUserId])
}
```

### JSON Field Handling

JSON fields are used to store complex data structures, such as user preferences. When handling JSON fields, it's essential to use proper type assertions to ensure type safety.

#### Reading JSON Fields

When reading JSON fields, use the `JSON.parse()` method to convert the JSON string to a JavaScript object. Always merge with default preferences to ensure all fields exist.

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { preferences: true }
});
const preferences = user.preferences ?? defaultPreferences;
```

#### Writing JSON Fields

When writing JSON fields, use the `JSON.stringify()` method to convert the JavaScript object to a JSON string.

```typescript
await prisma.userPreferences.upsert({
  where: { userId },
  create: {
    ...preferenceData,
    userId,
  },
  update: preferenceData,
});
```

### Preference Model Relations

The `UserPreferences` model has a one-to-one relation with the `User` model. When querying the `User` model, include the `preferences` relation to retrieve the user's preferences.

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { preferences: true }
});
```

### Type System

#### Application Types
Located in `src/types/user.ts`:

```typescript
interface UserPreferences {
  maxDistance: number;
  ageRange: { min: number; max: number };
  activityTypes: string[];
  availability: string[];
  gender: string[];
  lookingFor: string[];
  relationshipType: string[];
  verifiedOnly: boolean;
  withPhoto: boolean;
  privacyMode: AppLocationPrivacyMode;
  timeWindow: 'anytime' | 'today' | 'thisWeek' | 'thisMonth';
  useBluetoothProximity: boolean;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  safety: SafetyPreferences;
  language: string;
  timezone: string;
}

interface NotificationPreferences {
  matches: boolean;
  messages: boolean;
  events: boolean;
  safety: boolean;
  push: boolean;
  email: boolean;
  inApp: boolean;
  marketing: boolean;
  friendRequests: boolean;
  comments: boolean;
  likes: boolean;
  visits: boolean;
}

interface PrivacyPreferences {
  profile: 'public' | 'private';
  location: AppLocationPrivacyMode;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  showLocation: boolean;
  showAge: boolean;
}

interface SafetyPreferences {
  blockedUsers: string[];
  reportedUsers: string[];
  requireVerifiedMatch: boolean;
  meetupCheckins: boolean;
  emergencyContactAlerts: boolean;
}
```

### Safety

### Safety Preferences

Safety preferences are stored as part of the UserPreferences model. Key points:

1. **Blocked Users**
   - blockedUsers array stores IDs of blocked users
   - Use `blockedUsers.includes(userId)` to check if a user is blocked

2. **Reported Users**
   - reportedUsers array stores IDs of reported users
   - Use `reportedUsers.includes(userId)` to check if a user is reported

3. **Verified Match**
   - requireVerifiedMatch boolean determines if verified matches are required
   - Use `requireVerifiedMatch && !user.verified` to check if a match is not verified

4. **Meetup Checkins**
   - meetupCheckins boolean determines if meetup checkins are required
   - Use `meetupCheckins && !user.meetupCheckin` to check if a meetup checkin is not done

5. **Emergency Contact Alerts**
   - emergencyContactAlerts boolean determines if emergency contact alerts are enabled
   - Use `emergencyContactAlerts && user.emergencyContact` to check if emergency contact alerts are enabled

## Privacy

### Privacy Settings

Privacy settings are stored as part of the UserPreferences model. Key points:

1. **Profile Visibility**
   - profile visibility can be 'public' or 'private'
   - Use `profile === 'public'` to check if a profile is public

2. **Location Privacy**
   - location privacy uses AppLocationPrivacyMode enum
   - Use `location === AppLocationPrivacyMode.PUBLIC` to check if location is public

3. **Online Status**
   - showOnlineStatus boolean determines if online status is shown
   - Use `showOnlineStatus && user.online` to check if online status is shown

4. **Last Seen**
   - showLastSeen boolean determines if last seen is shown
   - Use `showLastSeen && user.lastSeen` to check if last seen is shown

5. **Location**
   - showLocation boolean determines if location is shown
   - Use `showLocation && user.location` to check if location is shown

6. **Age**
   - showAge boolean determines if age is shown
   - Use `showAge && user.age` to check if age is shown

## Notification Preferences

Notification preferences are stored as part of the UserPreferences model. Key points:

1. **Matches**
   - matches boolean determines if match notifications are enabled
   - Use `matches && user.matches` to check if match notifications are enabled

2. **Messages**
   - messages boolean determines if message notifications are enabled
   - Use `messages && user.messages` to check if message notifications are enabled

3. **Events**
   - events boolean determines if event notifications are enabled
   - Use `events && user.events` to check if event notifications are enabled

4. **Safety**
   - safety boolean determines if safety notifications are enabled
   - Use `safety && user.safety` to check if safety notifications are enabled

5. **Push**
   - push boolean determines if push notifications are enabled
   - Use `push && user.push` to check if push notifications are enabled

6. **Email**
   - email boolean determines if email notifications are enabled
   - Use `email && user.email` to check if email notifications are enabled

7. **In-App**
   - inApp boolean determines if in-app notifications are enabled
   - Use `inApp && user.inApp` to check if in-app notifications are enabled

8. **Marketing**
   - marketing boolean determines if marketing notifications are enabled
   - Use `marketing && user.marketing` to check if marketing notifications are enabled

9. **Friend Requests**
   - friendRequests boolean determines if friend request notifications are enabled
   - Use `friendRequests && user.friendRequests` to check if friend request notifications are enabled

10. **Comments**
    - comments boolean determines if comment notifications are enabled
    - Use `comments && user.comments` to check if comment notifications are enabled

11. **Likes**
    - likes boolean determines if like notifications are enabled
    - Use `likes && user.likes` to check if like notifications are enabled

12. **Visits**
    - visits boolean determines if visit notifications are enabled
    - Use `visits && user.visits` to check if visit notifications are enabled

### Common Issues and Solutions

1. **Preference Model Relations**:
   - Use proper includes when querying User model
   - Handle nullable preferences with default values
   - Use upsert for atomic preference updates

2. **Prisma Relations**:
   - Use `connect` when creating relations between models
   - Include related models in queries when needed
   - Handle nullable relations appropriately

3. **Type Safety**:
   - Use TypeScript interfaces for all models
   - Properly type JSON fields
   - Handle type conversions between Prisma and application types

4. **Performance**:
   - Use appropriate indexes on frequently queried fields
   - Include only necessary relations in queries
   - Cache frequently accessed data when appropriate

### Best Practices

1. **Error Handling**:
   - Always catch and properly handle database errors
   - Provide meaningful error messages
   - Use fallback values for missing data

2. **Data Validation**:
   - Validate input data before database operations
   - Ensure required fields are present
   - Check referential integrity

3. **Type Safety**:
   - Use strict TypeScript settings
   - Properly type all database operations
   - Handle JSON fields with appropriate type assertions

4. **Testing**:
   - Write unit tests for all database operations
   - Use test database for integration tests
   - Mock database calls in service tests

### Preference Model Troubleshooting

1. **Missing Preferences**:
   - Verify UserPreferences model is included in queries
   - Check for proper upsert operations
   - Handle missing preferences with defaults

2. **Invalid Preference Data**:
   - Validate input data before database operations
   - Ensure required fields are present
   - Check referential integrity

3. **Preference Update Issues**:
   - Use upsert for atomic preference updates
   - Handle nullable relations appropriately
   - Verify UserPreferences model is included in queries

### Future Improvements

1. **Schema Evolution**:
   - Add versioning for preference changes
   - Add migration support for preference updates
   - Improve query performance for preference-based matching

2. **Caching Layer**:
   - Add Redis caching for frequently accessed data
   - Implement cache invalidation strategy
   - Monitor cache hit rates

3. **Performance Optimizations**:
   - Add batch operations for multiple matches
   - Optimize queries for large datasets
   - Add more specific indexes based on usage patterns
   - Implement efficient preference filtering
