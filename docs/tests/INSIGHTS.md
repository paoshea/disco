# Test Insights and Troubleshooting Guide

This document captures interesting nuances discovered during testing and provides guidance for future troubleshooting. It also highlights areas where the codebase might need modifications based on test results.

## Matching Service (`match.service.ts`)

### User Type Conversion

**Test File**: `match.service.test.ts`

#### Key Insights:

1. **Role Handling**

   - Default role is 'user' if undefined
   - Supports 'admin' and 'moderator' roles
   - 🔍 **Potential Issue**: No validation against invalid role types
   - 💡 **Recommendation**: Add role validation in the service layer

2. **Location Privacy**

   - Location data is optional
   - Supports null accuracy values
   - 🔍 **Potential Issue**: No validation of privacy mode values
   - 💡 **Recommendation**: Add privacy mode enum validation

3. **Email Verification**

   - Handles both verified and unverified states
   - Uses null check for emailVerified field
   - 🔍 **Potential Issue**: Verification status could be more granular
   - 💡 **Recommendation**: Consider adding 'rejected' state for failed verifications

4. **Streak Counting**
   - Defaults to 0 if undefined
   - 🔍 **Potential Issue**: No maximum streak limit
   - 💡 **Recommendation**: Add reasonable upper bound for streak count

### Testing Infrastructure Insights

#### Mock Setup Requirements

1. **Prisma Client**

   - Must be mocked before any imports
   - Requires custom event methods mocking
   - 🔍 **Potential Issue**: Browser environment detection in tests
   - 💡 **Recommendation**: Add test environment configuration

2. **Location Services**
   - Requires mocking of utility functions
   - Privacy modes need careful consideration
   - 🔍 **Potential Issue**: Incomplete location validation
   - 💡 **Recommendation**: Add comprehensive location validation

#### Test Coverage Gaps

1. **Edge Cases**

   - Missing tests for:
     - Maximum field lengths
     - Special characters in names
     - International characters
   - 💡 **Recommendation**: Add validation tests for these cases

2. **Error Handling**
   - Need tests for:
     - Network failures
     - Database timeouts
     - Invalid data formats
   - 💡 **Recommendation**: Add error simulation tests

## Location Service (`location.service.ts`)

### Testing Insights

1. **Mock Type Safety**

   - TypeScript's type checking for mocked functions requires explicit typing
   - Use `jest.MockedFunction<typeof>` for proper mock typing
   - Example:
     ```typescript
     const mockFindFirst = prisma.location.findFirst as jest.MockedFunction<
       typeof prisma.location.findFirst
     >;
     ```

2. **Prisma Model Requirements**

   - PrismaUser model requires all fields to be present in mocks
   - Missing fields like `lastLogin`, `lastStreak`, `safetyEnabled` will cause type errors
   - Example required fields:
     ```typescript
     const mockUser: PrismaUser = {
       id: 'user2',
       firstName: 'John',
       lastName: 'Doe',
       email: 'john@example.com',
       // ... other required fields
       lastLogin: new Date(),
       lastStreak: new Date(),
       safetyEnabled: true,
     };
     ```

3. **Location Privacy Handling**

   - Location service properly handles different privacy modes
   - Tests verify privacy mode transitions (precise -> approximate)
   - Recommendation: Add validation for privacy mode values

4. **Error Handling**

   - Service returns `ServiceResponse` type with success/error states
   - Database errors are properly caught and transformed
   - Recommendation: Add more specific error types

5. **Nearby Users Search**
   - Uses geospatial queries with radius calculation
   - Filters out users based on:
     - Location sharing settings
     - Privacy modes
     - Last active timestamp
   - Recommendation: Add tests for different radius values

### Common Issues & Solutions

1. **Mock Data Complexity**

   ```typescript
   // Problem: Missing required fields
   const mockUser = {
     id: 'user1',
     // Missing fields...
   };

   // Solution: Use type assertion and include all fields
   const mockUser: PrismaUser = {
     id: 'user1',
     // All required fields...
   };
   ```

2. **Location Updates**

   ```typescript
   // Problem: Location update fails silently
   await locationService.updateLocation(userId, location);

   // Solution: Check response type
   const response = await locationService.updateLocation(userId, location);
   if (!response.success) {
     console.error(response.error);
   }
   ```

3. **Privacy Mode Changes**

   ```typescript
   // Problem: Invalid privacy mode
   await locationService.updateLocation(userId, {
     privacyMode: 'invalid',
   });

   // Solution: Use type-safe enum
   enum LocationPrivacyMode {
     PRECISE = 'precise',
     APPROXIMATE = 'approximate',
     ZONE = 'zone',
   }
   ```

### Test Coverage Goals

1. **Edge Cases**

   - [ ] Test maximum radius limits
   - [ ] Test location accuracy thresholds
   - [ ] Test timezone handling

2. **Performance Tests**

   - [ ] Test nearby user search with large datasets
   - [ ] Test location update batching
   - [ ] Test concurrent updates

3. **Integration Tests**
   - [ ] Test with real geolocation data
   - [ ] Test with real-time updates
   - [ ] Test with background sync

### Monitoring Recommendations

1. **Key Metrics**

   - Location update frequency per user
   - Privacy mode distribution
   - Search radius patterns
   - Error rates by type

2. **Alert Conditions**
   - High error rate in location updates
   - Unusual privacy mode changes
   - Large number of nearby searches
   - Database query timeouts

### Future Improvements

1. **Type Safety**

   - Create stricter types for location data
   - Add validation decorators
   - Use zod for runtime validation

2. **Error Handling**

   - Add custom error classes
   - Improve error messages
   - Add retry logic for transient failures

3. **Performance**

   - Add caching for nearby searches
   - Implement batch updates
   - Optimize geospatial queries

4. **Testing**
   - Add property-based tests
   - Add load tests
   - Add end-to-end tests

## Profile Service (`profile.service.ts`)

### Profile Edit Component (`ProfileEdit.tsx`)

**Test File**: `ProfileEdit.test.tsx`

#### Key Insights:

1. **Form Validation**

   - Required fields (firstName, lastName, email) are properly validated
   - Email format validation using regex pattern
   - Phone number format validation (optional field)
   - 🔍 **Potential Issue**: Consider using a more robust email validation library
   - 💡 **Recommendation**: Add internationalization support for phone numbers

2. **State Management**

   - Loading state properly managed during form submission
   - Error state handled with accessibility considerations (role="alert")
   - 🔍 **Potential Issue**: No debounce on form submission
   - 💡 **Recommendation**: Add debounce to prevent double submissions

3. **Data Updates**

   - Only changed fields are sent to the server
   - Prevents unnecessary data transmission
   - 🔍 **Potential Issue**: No optimistic updates
   - 💡 **Recommendation**: Implement optimistic updates for better UX

4. **Accessibility**
   - Error messages use proper ARIA roles
   - Form controls properly labeled
   - 🔍 **Potential Issue**: No keyboard navigation for interest selection
   - 💡 **Recommendation**: Enhance keyboard accessibility

#### Testing Infrastructure Insights

1. **Mock Setup**

   - User mock data needs careful date handling
   - Update function mocking requires proper typing
   - 🔍 **Potential Issue**: Timezone handling in tests
   - 💡 **Recommendation**: Add explicit timezone tests

2. **Test Coverage**
   - Form validation thoroughly tested
   - Error handling scenarios covered
   - Loading states verified
   - 🔍 **Potential Issue**: Missing tests for concurrent updates
   - 💡 **Recommendation**: Add race condition tests

## Geolocation Hook (`useGeolocation.ts`)

**Test File**: `useGeolocation.test.ts`

### Key Insights:

1. **State Management**

   - 🔍 **Issue**: Initial implementation caused infinite update loops due to effect dependencies
   - ✅ **Solution**: Used `useRef` for options to prevent unnecessary rerenders
   - 💡 **Best Practice**: Store frequently changing props in refs when they're only needed in effects

2. **Async Testing**

   - 🔍 **Issue**: React warnings about updates not wrapped in act()
   - ✅ **Solution**: Used Jest's timer mocking (`useFakeTimers`) and properly wrapped updates in `act`
   - 💡 **Best Practice**: For geolocation testing:
     - Mock the navigator.geolocation API
     - Use fake timers to control async behavior
     - Wrap state updates in act()

3. **Effect Dependencies**

   - 🔍 **Issue**: Including options in effect dependencies caused unnecessary reruns
   - ✅ **Solution**: Only included stable callbacks in dependencies, read options from ref
   - 💡 **Best Practice**: Minimize effect dependencies to prevent unnecessary reruns

4. **Mock Implementation**
   - Properly mocks both `getCurrentPosition` and `watchPosition`
   - Simulates both success and error cases
   - Handles timeout and unsupported browser scenarios
   - 💡 **Recommendation**: Consider adding tests for permission denied cases

### Future Considerations

1. **Edge Cases**

   - [ ] Test high-frequency position updates
   - [ ] Test position accuracy thresholds
   - [ ] Test behavior when switching between watch and single-shot modes

2. **Error Handling**

   - [ ] Add specific error codes for different failure scenarios
   - [ ] Consider retry logic for transient failures
   - [ ] Add timeout handling for slow position responses

3. **Performance**
   - [ ] Monitor effect rerun frequency
   - [ ] Consider caching recent position updates
   - [ ] Implement debouncing for high-frequency updates in watch mode

## Session Management (`session.test.ts`)

### Testing Insights

1. **State Management with Zustand**

   - Mock implementation requires careful handling of state updates
   - State must be properly cleared during token expiration
   - 🔍 **Potential Issue**: State updates might not trigger React re-renders
   - 💡 **Recommendation**: Return new object references to ensure React updates

2. **localStorage Persistence**

   - All auth-related items must be cleared on token expiration:
     - `auth-storage`
     - `token`
     - `refreshToken`
   - 🔍 **Potential Issue**: Incomplete cleanup could lead to state inconsistencies
   - 💡 **Recommendation**: Maintain a list of all auth-related storage keys

3. **Token Expiration Handling**

   - Requires proper error interception from API client
   - Must handle both state and storage cleanup
   - Must trigger navigation to login page
   - 🔍 **Potential Issue**: Race conditions between cleanup and navigation
   - 💡 **Recommendation**: Consider using a cleanup queue

4. **Testing Infrastructure**
   - Mock implementations should match real behavior:
     - State updates
     - Storage persistence
     - Navigation
   - 💡 **Recommendation**: Extract mock implementations to shared test utilities

## OAuth Integration (`auth.ts`)

**Test File**: `oauth.test.tsx`

#### Key Insights:

1. **Mock Strategy**

   - Created dedicated mock provider for Google OAuth
   - Mocked NextAuth.js functions using Jest
   - 🔍 **Potential Issue**: Need to consider mocking other OAuth providers (e.g., Facebook, GitHub)
   - 💡 **Recommendation**: Create a mock factory for different OAuth providers

2. **Environment Variables**

   - Tests verify proper handling of missing OAuth configuration
   - Mock environment variables set in test setup
   - 🔍 **Potential Issue**: Environment variables not validated at runtime
   - 💡 **Recommendation**: Add runtime validation for critical OAuth configuration

3. **Error Handling**

   - Tests cover OAuth sign-in failures
   - Error messages properly displayed with accessibility roles
   - 🔍 **Potential Issue**: Limited error scenarios covered
   - 💡 **Recommendation**: Add tests for network failures, timeout scenarios

4. **Session Management**

   - Session persistence verified after OAuth login
   - Session expiry properly handled
   - 🔍 **Potential Issue**: No tests for token refresh flow
   - 💡 **Recommendation**: Add tests for automatic token refresh

5. **Profile Synchronization**
   - Tests verify user profile data sync after OAuth login
   - 🔍 **Potential Issue**: No tests for partial profile data
   - 💡 **Recommendation**: Add tests for handling incomplete OAuth profile data

#### Testing Infrastructure Insights:

1. **Jest Configuration**

   - Required special setup for ES modules and JSX
   - Custom transformIgnorePatterns for NextAuth dependencies
   - 🔍 **Potential Issue**: Complex setup might be hard to maintain
   - 💡 **Recommendation**: Document Jest configuration requirements

2. **Component Testing**
   - Error components tested with React Testing Library
   - Proper accessibility testing included
   - 🔍 **Potential Issue**: Limited integration with actual UI components
   - 💡 **Recommendation**: Add more UI integration tests

## Event Service Testing Insights

### Event Validation and Error Handling

1. **Event Existence Checks**

   - Always validate event existence before operations (update, join, etc.)
   - Use `findUnique` for precise record lookup
   - Return early with appropriate error messages when event not found

2. **Participant Management**

   - Track participants using a separate join table
   - Validate participant count against `maxParticipants`
   - Prevent duplicate joins and creator self-joins
   - Include participant user details in responses

3. **Mock Data Structure**
   - Mock event data should include:
     ```typescript
     {
       id: string
       title: string
       description: string
       type: 'social' | 'virtual' | 'hybrid'
       creatorId: string
       latitude: number
       longitude: number
       startTime: Date
       endTime: Date
       maxParticipants: number
       participants: Array<{
         id: string
         userId: string
         eventId: string
         user: {
           id: string
           firstName: string
           lastName: string
           email: string
         }
       }>
       tags: string[]
       createdAt: Date
       updatedAt: Date
     }
     ```

### Testing Strategies

1. **Prisma Mock Setup**

   - Mock all required Prisma client methods:
     ```typescript
     prisma.event.create;
     prisma.event.findMany;
     prisma.event.findFirst;
     prisma.event.findUnique;
     prisma.event.update;
     prisma.event.delete;
     ```
   - Include proper type assertions for mocked functions

2. **Test Cases Coverage**

   - Event Creation:
     - Successful creation with valid data
     - Validation of required fields
     - Future date validation for event times
   - Event Updates:
     - Successful updates with valid data
     - Handling non-existent events
   - Event Joining:
     - Successful participant addition
     - Full event handling
     - Creator join prevention
     - Participant count validation

3. **Response Structure**
   - All operations return a consistent `ServiceResponse` type:
     ```typescript
     {
       success: boolean
       data?: T
       error?: string
     }
     ```
   - Include specific error messages for different failure cases

### Best Practices

1. **Data Consistency**

   - Always include creator and participant details in responses
   - Maintain consistent date formats across the service
   - Use proper typing for event properties

2. **Error Messages**

   - Use clear, specific error messages:
     - "Event not found"
     - "Event is full"
     - "Cannot join your own event"
   - Include error logging for debugging

3. **Performance Considerations**
   - Use `findUnique` for single record lookups
   - Include necessary relations in single query using `include`
   - Batch participant updates when possible

## Recommended Codebase Modifications

### Immediate Improvements

1. **Type Safety**

   ```typescript
   // Add enum for role types
   export enum UserRole {
     USER = 'user',
     ADMIN = 'admin',
     MODERATOR = 'moderator',
   }
   ```

2. **Validation**

   ```typescript
   // Add validation functions
   export function validateUserRole(role: string): boolean {
     return ['user', 'admin', 'moderator'].includes(role);
   }
   ```

3. **Error Handling**
   ```typescript
   // Add custom error types
   export class InvalidUserRoleError extends Error {
     constructor(role: string) {
       super(`Invalid user role: ${role}`);
     }
   }
   ```

### Future Considerations

1. **Performance**

   - Add caching for frequently accessed user data
   - Implement batch processing for multiple user conversions

2. **Security**

   - Add rate limiting for role changes
   - Implement audit logging for sensitive operations

3. **Maintainability**
   - Create separate validation module
   - Add comprehensive error mapping

## Common Troubleshooting Scenarios

### 1. User Role Issues

```typescript
// Problem: User role not being set correctly
const user = convertToAppUser(prismaUser);
console.log(user.role); // undefined

// Solution: Check Prisma schema for role field default
// Ensure role is being set in database
```

### 2. Location Privacy

```typescript
// Problem: Location privacy mode not working
const user = convertToAppUser(prismaUser);
console.log(user.location?.privacyMode); // undefined

// Solution: Verify privacyMode is set in locations table
// Check LocationPrivacyMode type definition
```

### 3. Streak Count Reset

```typescript
// Problem: Streak count unexpectedly reset
const user = convertToAppUser(prismaUser);
console.log(user.streakCount); // 0

// Solution: Check for undefined vs null
// Verify streak calculation logic
```

## Test Environment Setup

### Required Mocks

```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    event: { findNearby: jest.fn() },
    $queryRaw: jest.fn(),
  },
}));

jest.mock('@/lib/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));
```

### Common Test Failures

1. **Prisma Browser Environment Error**

   - Cause: Test environment not properly configured
   - Solution: Mock Prisma client before any imports

2. **Redis Connection Error**

   - Cause: Redis client not properly mocked
   - Solution: Add comprehensive Redis mock

3. **Location Service Failures**
   - Cause: Missing location utility mocks
   - Solution: Mock all location-related functions

## Monitoring Recommendations

1. **Key Metrics to Track**

   - User role change frequency
   - Location privacy mode usage
   - Streak count distribution

2. **Alert Conditions**
   - High rate of role changes
   - Unusual location patterns
   - Streak count anomalies

## Future Test Coverage Goals

1. **Integration Tests**

   - Add tests for role-based access control
   - Test location privacy in real scenarios
   - Verify streak calculation accuracy

2. **Performance Tests**

   - Measure user conversion speed
   - Test batch processing capability
   - Verify caching effectiveness

3. **Security Tests**
   - Test role change restrictions
   - Verify location privacy enforcement
   - Validate data access controls

## Authentication and Session Testing

### useAuth Hook Testing

#### Key Insights:

1. **API Client Mocking**

   - Mock the entire API client module, not just individual methods
   - Ensure mock maintains the same interface as the real client
   - Example of proper API client mock:
     ```typescript
     jest.mock('@/services/api/api.client', () => ({
       __esModule: true,
       default: {
         post: jest.fn(),
         interceptors: {
           request: { use: jest.fn(), eject: jest.fn() },
           response: { use: jest.fn(), eject: jest.fn() },
         },
       },
     }));
     ```

2. **Session State Management**

   - Initialize with proper null state, not undefined
   - Mock session data consistently across related tests
   - Handle session status transitions properly:
     - unauthenticated → authenticated
     - authenticated → unauthenticated

3. **NextAuth Integration**
   - Mock NextAuth hooks before any imports
   - Ensure consistent behavior between useSession and signIn/signOut
   - Example:
     ```typescript
     jest.mock('next-auth/react');
     (useSession as jest.Mock).mockReturnValue({
       data: mockSession,
       status: 'authenticated',
     });
     ```

### React Component Testing

#### State Updates in Tests

1. **Act Warnings**

   - Wrap state updates in act() to prevent warnings
   - Include both synchronous and asynchronous operations
   - Example:
     ```typescript
     await act(async () => {
       fireEvent.click(submitButton);
     });
     ```

2. **Form Submissions**
   - Test both success and failure scenarios
   - Verify loading states during submission
   - Check proper error message display
   - Example test structure:
     ```typescript
     it('handles form submission error', async () => {
       mockApiCall.mockRejectedValue(new Error());
       await act(async () => {
         fireEvent.submit(form);
       });
       expect(errorMessage).toBeInTheDocument();
     });
     ```

### Testing Best Practices

1. **Mock Reset**

   - Clear all mocks in beforeEach
   - Reset specific mock implementations between tests
   - Example:
     ```typescript
     beforeEach(() => {
       jest.clearAllMocks();
       mockApiClient.post.mockReset();
     });
     ```

2. **Type Safety**

   - Use proper TypeScript types for mocked functions
   - Maintain type consistency with real implementations
   - Example:
     ```typescript
     const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
     ```

3. **Async Operations**
   - Always await async operations in tests
   - Use proper error boundaries for failed operations
   - Test both resolved and rejected promises

### Areas for Improvement

1. **Test Coverage**

   - [ ] Add tests for token refresh scenarios
   - [ ] Test session timeout handling
   - [ ] Add tests for concurrent auth operations

2. **Error Handling**

   - [ ] Test network timeout scenarios
   - [ ] Test invalid token responses
   - [ ] Test session recovery after errors

3. **Performance**
   - [ ] Monitor auth hook re-render frequency
   - [ ] Test caching of auth state
   - [ ] Measure token refresh impact
