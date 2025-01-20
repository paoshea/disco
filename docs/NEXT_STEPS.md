# DISCO! Platform Development Roadmap

# Disco Codebase Reorganization Action Plan

## Objective

Reorganize the Disco codebase to improve maintainability, reduce duplication, and clarify frontend/backend separation while preserving Next.js conventions.

# Rem Useful terminal commands

npm audit fix
npm run format:check
npm run format  
npx prettier --write .
npx eslint . --fix

npm run type-check  
npm run lint --fix
npm run lint

npm run type-check:watch
npm run lint:watch

npm run test
npm run test:watch

npm run verify-env

rm -rf .next/  
npm run build

## Pre-Migration Checklist

- [ ] Create git branch: `refactor/codebase-reorganization`
- [ ] Take snapshot of current test coverage
- [ ] Document current build time metrics
- [ ] Verify all tests pass in current state

## 1. File Migrations

### Hooks Migration

- [ ] Move `app/hooks/useAuth.ts` → `src/hooks/useAuth.ts`
  - [ ] Update imports in all files using useAuth
  - [ ] Test auth functionality after move
  - [ ] Remove empty app/hooks directory

### Auth Service Reorganization

- [ ] Create `src/services/auth` directory
- [ ] Move `src/services/api/auth.service.ts` → `src/services/auth/auth.service.ts`
  - [ ] Update service imports
  - [ ] Test all auth endpoints
  - [ ] Verify JWT token handling

### API Client Restructuring

- [ ] Create `src/lib/api` directory
- [ ] Move `src/services/api/api.client.ts` → `src/lib/api/client.ts`
  - [ ] Update all API client imports
  - [ ] Test API connectivity
  - [ ] Verify error handling

### Dashboard Components

- [ ] Create `src/components/dashboard` directory
- [ ] Move from `app/dashboard/components/` to `src/components/dashboard/`:
  - [ ] `DashboardHeader.tsx`
  - [ ] `DashboardStats.tsx`
- [ ] Update dashboard page imports
- [ ] Test dashboard rendering

## 2. Import Path Updates

- [ ] Update tsconfig.json paths if needed
- [ ] Run search for all affected imports
- [ ] Update import statements in:
  - [ ] Components
  - [ ] Pages
  - [ ] API routes
  - [ ] Tests
- [ ] Run TypeScript compiler to catch any missed imports

## 3. Testing Strategy

- [ ] Unit Tests
  - [ ] Verify all component tests pass
  - [ ] Update test import paths
  - [ ] Add tests for any untested code paths
- [ ] Integration Tests
  - [ ] Test auth flow end-to-end
  - [ ] Test API endpoints
  - [ ] Test dashboard functionality
- [ ] E2E Tests
  - [ ] Run full Cypress/Playwright suite
  - [ ] Verify critical user journeys

## 4. Verification Steps

- [ ] Build Verification
  - [ ] Run `npm run build`
  - [ ] Verify no build errors
  - [ ] Compare build size metrics
- [ ] Runtime Verification
  - [ ] Start development server
  - [ ] Test all major features
  - [ ] Verify hot reload works
- [ ] Type Checking
  - [ ] Run `tsc --noEmit`
  - [ ] Fix any type errors

## 5. Documentation Updates

- [ ] Update README.md with new file structure
- [ ] Document any changed import patterns
- [ ] Update API documentation if needed
- [ ] Update contribution guidelines

## 6. Performance Validation

- [ ] Compare build times
- [ ] Run lighthouse scores
- [ ] Check bundle sizes
- [ ] Verify no regression in:
  - [ ] First Load JS
  - [ ] First Contentful Paint
  - [ ] Time to Interactive

## 7. Clean Up

- [ ] Remove any empty directories
- [ ] Delete unused files
- [ ] Clean up any duplicate types
- [ ] Remove unused imports
- [ ] Format all modified files

## Success Criteria

- [ ] All tests passing
- [ ] Build succeeding
- [ ] No TypeScript errors
- [ ] No runtime errors
- [ ] No performance regression
- [ ] Improved code organization
- [ ] Clear separation of concerns
- [ ] Maintainable file structure

## Rollback Plan

1. Create a backup branch before starting
2. Document all changed files
3. Prepare rollback commands
4. Test rollback procedure

## Notes

- Keep Next.js routing structure intact
- Maintain backwards compatibility
- Follow atomic commits
- Update PR with before/after metrics

## Other pendings

1. Potential Cleanup:
   `@types/bcryptjs`: If you’re not using bcryptjs directly, but rather its Edge-compatible alternative (`@edge-runtime/bcrypt`), this can be removed.
   `@types/react-router-dom`: Since you’re using `react-router-dom`v6+, you don’t need this if you don’t rely on deprecated methods.
2. Mobile Responsiveness.

## Core Infrastructure

- [x] Microservices Architecture Setup
- [x] API Gateway Implementation
- [x] Database Schema Design
- [x] Redis Caching Layer
- [x] WebSocket Infrastructure
- [x] Basic CI/CD Pipeline
- [x] Development Environment Setup
- [x] Production Environment Configuration
- [x] Monitoring Setup (Prometheus/Grafana)
- [x] Core API Service Integration Tests
- [x] Real-time Service Load Testing
- [x] End-to-end Testing Infrastructure

## Backend Services

### Core API Service

- [x] User Management
- [x] Authentication System
- [x] Rate Limiting
- [x] Error Handling
- [x] Logging System
- [x] API Documentation
- [x] Chat Service Integration
- [x] Location Service Implementation
  - [x] Update location endpoint (/api/location/update)
  - [x] Last location endpoint (/api/location/last)
  - [x] Location sharing controls (/api/location/sharing)
  - [x] Privacy settings (/api/location/privacy)
- [x] Event Services
  - [x] Event creation and management (/api/events)
  - [x] Location-based discovery (/api/events/nearby)
  - [x] Event participation (/api/events/{id}/join, /api/events/{id}/leave)
  - [x] Calendar integration
- [x] WebSocket Service Implementation
  - [x] Real-time presence detection
  - [x] Typing indicators
  - [x] Location updates streaming
  - [x] Event notifications
- [x] Safety Service Integration
  - [x] Emergency contact management
  - [x] Safety check-ins
  - [x] Alert system
  - [x] Location privacy
- [x] Matching Service Features
  - [x] Profile matching algorithm
  - [x] Preference-based filtering
  - [x] Match status management
  - [x] Activity coordination
- [ ] Retry Logic for Failed API Calls
- [ ] TypeScript Documentation for Service Methods
- [ ] Service Method Test Coverage
- [ ] Enhanced Error Handling
- [ ] Analytics Service Integration
- [ ] User Streak System
- [ ] Gamification Engine

### Real-time Features

- [x] WebSocket Infrastructure
  - [x] Connection management
  - [x] Event handling
  - [x] Reconnection logic
  - [x] Error recovery
- [x] Push Notifications
  - [x] Service worker setup
  - [x] Notification permissions
  - [x] Custom notification types
  - [x] Action handlers
- [x] Live Updates
  - [x] Location streaming
  - [x] Match notifications
  - [x] Event updates
  - [x] Safety alerts

### Frontend Components

- [x] Authentication UI
  - [x] Login/Register forms
  - [x] Password recovery
  - [x] Social auth integration
- [x] Profile Management
  - [x] Profile editing
  - [x] Preference management
  - [x] Privacy settings
- [x] Location Features
  - [x] Location permission handling
  - [x] Privacy controls
  - [x] Nearby user discovery
  - [x] Distance calculations
- [x] Event Management
  - [x] Event creation
  - [x] Discovery interface
  - [x] Participation controls
  - [x] Calendar view
- [x] Safety Center
  - [x] Emergency contacts
  - [x] Safety check-ins
  - [x] Alert triggers
  - [x] Privacy zones
- [x] Matching Interface
  - [x] Match discovery
  - [x] Preference filters
  - [x] Match actions
  - [x] Chat integration

## Spontaneous Social Engagement Implementation Order

### Phase 1: Core Location & Privacy Foundation

1. Privacy-focused location processing

   - Essential for user trust and data protection
   - Foundation for all location-based features
   - Must be implemented before any location features go live

2. Profile visibility controls

   - Allow users to control what potential matches can see
   - Set up granular privacy settings
   - Enable temporary profile visibility options

3. Flexible radius settings (100ft to 1 mile)
   - Core functionality for defining "nearness"
   - User-configurable proximity thresholds
   - Integration with existing geohashing system

### Phase 2: Matching & Filtering

4. Interest-based matching

   - Define interest categories and tags
   - Implement matching algorithm weights
   - Create interest-based filtering UI

5. Activity-based filtering
   - Time-window preferences
   - Activity type matching
   - Availability status system

### Phase 3: Real-time Notifications

6. Push notification system

   - Near-match notifications
   - Chat request alerts
   - Safety check notifications
   - Custom notification preferences

7. Battery-optimized background location
   - Intelligent location update intervals
   - Geofencing optimization
   - Battery usage monitoring
   - Background task management

### Phase 4: Enhanced Proximity Features

8. Bluetooth proximity enhancement

   - Short-range precise matching
   - Battery-efficient proximity detection
   - Indoor location enhancement

9. Contact information sharing settings
   - Progressive information disclosure
   - Mutual match information sharing
   - Temporary contact sharing options

### Success Criteria for Each Phase

- Phase 1: Users can safely share location and control visibility
- Phase 2: Users are matched based on compatible interests and activities
- Phase 3: Users receive timely notifications about potential matches
- Phase 4: Enhanced proximity detection and secure information sharing

### Dependencies

- Phase 1 must be completed before any other phases
- Phase 2 can begin once basic privacy controls are in place
- Phase 3 requires completion of Phase 1
- Phase 4 can run in parallel with Phase 3

### Metrics for Success

- Battery impact < 5% per day
- Match notification latency < 30 seconds
- False positive matches < 10%
- User privacy control satisfaction > 90%

## Priority Features From README.md

### Priority 1: Core Privacy & Security Features

- [ ] Zero personal data storage implementation
- [ ] End-to-end encrypted communications
- [ ] Approximate distance indicators
- [ ] Verified identity system integration
- [ ] Chat history auto-deletion (24h)
- [ ] Custom privacy zones
- [ ] AI-powered content screening
- [ ] 24/7 human moderation system
- [ ] Temporary Opt-Out by User, similar to focus mode
- [ ] Chat archive and block system
  - [ ] Secure chat archival before blocking
  - [ ] Encrypted archive storage
  - [ ] Configurable retention periods
  - [ ] Archive export functionality
- [ ] Progressive information disclosure system
- [ ] Enhanced privacy mode controls

### Priority 2: Location & Discovery

- [ ] Battery-optimized background location
  - [ ] Motion-based updates
  - [ ] Activity recognition integration
  - [ ] Batch processing of location data
- [ ] Bluetooth proximity enhancement
  - [ ] Indoor positioning system
  - [ ] Mesh networking support
  - [ ] Privacy-preserving device identification
- [ ] Flexible radius settings (100ft to 1 mile)
- [ ] Google Places API integration for safe spots
- [ ] Privacy-focused location processing
- [ ] Custom time-window preferences
- [ ] Professional networking mode
- [ ] Touch-friendly mobile interface for location features
- [ ] Location-based push notifications
- [ ] Privacy zones with automatic discovery toggle
- [ ] Dynamic privacy zone management
- [ ] Context-aware privacy rules

### Priority 3: Safety Infrastructure

- [ ] Real-time safety check-ins
- [ ] Emergency contact system
  - [ ] Multiple notification triggers
  - [ ] Customizable alert preferences
  - [ ] Location sharing controls
- [ ] Community rating implementation
- [ ] Law enforcement partnership API
- [ ] 24/7 emergency hotline integration
- [ ] Safety Center portal
- [ ] Suspicious behavior detection
- [ ] Scheduled safety check-in reminders
- [ ] Emergency alert system with location sharing
- [ ] Emergency contact notification system
- [ ] Two-factor authentication implementation
- [ ] Login notification system
- [ ] Device management system
- [ ] Enhanced block management
  - [ ] Block expiration reminders
  - [ ] Block review suggestions
  - [ ] Improved blocking criteria

### Priority 4: User Experience & Notifications

- [ ] Battery optimization
- [ ] Enhanced Push Notification System
  - [ ] Priority-based delivery
  - [ ] Smart polling implementation
  - [ ] Batch notifications
  - [ ] Silent push notifications
- [ ] Profile customization
- [ ] Interest-based matching
- [ ] Activity-based filtering
- [ ] Meeting feedback system
- [ ] City-based availability control
- [ ] Rich notifications
  - [ ] Interactive responses
  - [ ] Custom sound profiles
  - [ ] Context-aware delivery
- [ ] AI-powered notification relevance filtering

### Priority 5: Chat & Communication

- [ ] Enhanced Chat System
  - [ ] Media message support
  - [ ] Voice messages
  - [ ] Location sharing
  - [ ] Link previews
- [ ] Privacy-Focused Chat Features
  - [ ] Message expiration
  - [ ] Screenshot detection
  - [ ] Secure media storage
  - [ ] Anonymous mode
- [ ] Real-time Features
  - [ ] Typing indicators
  - [ ] Read receipts
  - [ ] Online status
  - [ ] Presence tracking
- [ ] Chat Security
  - [ ] End-to-end encryption
  - [ ] Perfect forward secrecy
  - [ ] Key verification
  - [ ] Secure key storage

### Priority 6: Community Features

- [ ] Public roadmap integration
- [ ] City expansion voting system
- [ ] Community blog integration
- [ ] Success metrics tracking
- [ ] User testimonials system
- [ ] Community guidelines enforcement
- [ ] Connection request management system
- [ ] User blocking functionality
- [ ] Group chats
- [ ] Message reactions
- [ ] Community achievements
- [ ] Trust score system

### Priority 7: Support Infrastructure

- [ ] 24/7 in-app support chat
- [ ] Support ticket system
- [ ] Email support integration
- [ ] Help center documentation
- [ ] FAQ system
- [ ] User feedback collection

### Priority 8: Analytics & Reporting

- [ ] Safety rating analytics
- [ ] Connection success metrics
- [ ] User engagement tracking
- [ ] City performance analytics
- [ ] Feature usage statistics
- [ ] Community health monitoring

### Priority 9: Accessibility Features

- [ ] Screen reader support implementation
- [ ] Keyboard navigation system
- [ ] High contrast mode
- [ ] Font size adjustment controls
- [ ] ARIA label implementation
- [ ] Accessibility testing framework
- [ ] Accessibility documentation

## Progress Tracking

- Total Completed Features: 150
- Features In Progress: 0
- Planned Features: 0
- Completion Percentage: 100%

## Priority Matrix

### Immediate Priority

1. Authentication & Navigation

   - Post-authentication flow
   - Dashboard implementation
   - Session management
   - Verification system

2. Core Gamification

   - Streak system
   - Basic achievements
   - Activity tracking
   - User dashboard

3. Safety Features

   - Emergency contacts
   - Location sharing
   - Real-time alerts
   - Blocking/reporting

4. Testing & Reliability
   - Authentication tests
   - Error handling
   - Performance monitoring

### Medium Priority

1. Enhanced Gamification

   - Advanced achievements
   - Community rewards
   - Leaderboards

2. Community Features

   - Group activities
   - Event system
   - Social interactions

3. Mobile Experience
   - Responsive design
   - Offline support
   - Push notifications

### Long-term Goals

1. Advanced Features

   - AI recommendations
   - Advanced analytics
   - Premium features

2. Platform Expansion
   - Geographic scaling
   - Language support
   - Cultural adaptation

## Notes

- Focus on core authentication and dashboard first
- Implement gamification gradually to maintain engagement
- Ensure all features support safety and privacy
- Regular user feedback and iteration
- Monitor engagement metrics and adjust features accordingly

## Empty Folders (Implementation Priority)

### Priority 1: Core Types and Shared Libraries

These are foundational and should be implemented first as other components depend on them:

- `/backend/libs/dto-types` - Data transfer object types
- `/backend/libs/common-utils` - Common utility functions
- `/backend/libs/security` - Security utilities

### Priority 2: Core Service Foundations

Essential service components needed for basic functionality:

- `/backend/services/core-api/internal/repository` - Data repositories
- `/backend/services/core-api/internal/validators` - Input validators
- `/backend/services/core-api/api/v1` - API v1 endpoints
- `/backend/services/user-service/src/entities` - Data entities
- `/backend/services/user-service/src/dto` - Data transfer objects
- `/backend/services/user-service/src/controllers` - Request controllers
- `/backend/services/user-service/src/services` - Service implementations

### Priority 3: Supporting Services

Services that enhance core functionality:

- `/backend/services/location-service/src/models` - Data models
- `/backend/services/location-service/src/services` - Service implementations
- `/backend/services/location-service/src/utils` - Utility functions
- `/backend/services/matching-service/lib/models` - Data models
- `/backend/services/matching-service/lib/services` - Service implementations
- `/backend/services/matching-service/lib/channels` - Communication channels

### Priority 4: Service Configuration

Configuration needed for service deployment:

- `/backend/services/core-api/config` - Core API configuration
- `/backend/services/user-service/config` - User service configuration
- `/backend/services/location-service/config` - Location service configuration
- `/backend/services/matching-service/config` - Matching service configuration
- `/backend/services/core-api/internal/cache` - Caching layer
- `/backend/services/user-service/src/middleware` - Service middleware

### Priority 5: Testing Infrastructure

Test suites for ensuring service reliability:

- `/backend/services/core-api/tests` - Core API test suite
- `/backend/services/user-service/test` - User service test suite
- `/backend/services/location-service/tests` - Location service test suite
- `/backend/services/matching-service/test` - Matching service test suite

### Priority 6: Deployment Infrastructure

Infrastructure as code and deployment configurations:

- `/backend/deploy/terraform/modules` - Terraform modules
- `/backend/deploy/terraform/environments` - Terraform environment configurations
- `/backend/deploy/kubernetes/base/core-api` - Core API base configuration
- `/backend/deploy/kubernetes/base/user-service` - User service base configuration
- `/backend/deploy/kubernetes/base/location-service` - Location service base configuration
- `/backend/deploy/kubernetes/base/matching-service` - Matching service base configuration

### Priority 7: Environment-Specific Configurations

Environment overlays and initialization:

- `/backend/deploy/kubernetes/overlays/dev` - Kubernetes development overlay
- `/backend/deploy/kubernetes/overlays/staging` - Kubernetes staging overlay
- `/backend/deploy/kubernetes/overlays/prod` - Kubernetes production overlay
- `/backend/init-scripts` - Initialization scripts
- `/backend/scripts/database` - Database management scripts
- `/backend/scripts/monitoring` - Monitoring setup scripts
- `/backend/services/core-api/cmd` - Command line tools
- `/backend/services/core-api/pkg` - Shared packages

### Aim to standardize on one library as soon as possible to avoid the issues mentioned below.

# Replace jsonwebtoken with jose

Using both `jsonwebtoken` and `jose` in the same project is technically possible, but it's generally not ideal due to potential redundancy, increased bundle size, and confusion about which library to use for specific tasks. Here's a detailed breakdown:

### **1. Compatibility and Use Case Differences**

- **`jsonwebtoken`**:

  - A popular library for working with JWTs in Node.js environments.
  - Provides functions like `sign`, `verify`, and `decode`.
  - Heavily relies on Node.js-specific modules like `crypto` and is **not Edge-compatible** (e.g., for Next.js API routes running in the Edge Runtime).

- **`jose`**:
  - A modern library designed to work in both **Node.js and web environments** (e.g., Edge Runtime, browsers).
  - Supports JWTs and other JOSE standards (JWS, JWE, JWK).
  - Works seamlessly with modern web crypto APIs, making it ideal for Next.js applications with serverless or Edge runtime requirements.

### **2. Potential Issues**

- **Redundancy**:

  - Both libraries offer overlapping functionality for handling JWTs, which can lead to confusion about which one to use in specific parts of your code.
  - This also increases your bundle size unnecessarily, especially if you're using both in client-side code.

- **Inconsistent Behavior**:

  - If parts of your codebase rely on `jsonwebtoken` and others on `jose`, subtle differences in API behavior or token verification could lead to bugs or security risks.

- **Edge Runtime Incompatibility**:
  - If you use `jsonwebtoken` in Edge-compatible routes or client-side code, you will encounter runtime errors because `jsonwebtoken` relies on Node.js-specific modules.

### **3. Recommendation**

If you are starting fresh or aiming for compatibility with modern environments (like Edge), **migrate entirely to `jose`**. It is more future-proof and works in all the environments where `jsonwebtoken` might fail.

### **4. How to Replace `jsonwebtoken` with `jose`**

Here’s how common tasks can be done using `jose`:

#### Signing a JWT:

```typescript
import { SignJWT } from 'jose';

async function createToken(payload: object, secretKey: string) {
  const secret = new TextEncoder().encode(secretKey);

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret);

  return token;
}
```

#### Verifying a JWT:

```typescript
import { jwtVerify } from 'jose';

async function verifyToken(token: string, secretKey: string) {
  const secret = new TextEncoder().encode(secretKey);

  const { payload } = await jwtVerify(token, secret);
  return payload; // Decoded payload
}
```

#### Decoding a JWT (without verification):

```typescript
import { decodeJwt } from 'jose';

function decodeToken(token: string) {
  return decodeJwt(token);
}
```

### **5. Migrating Gradually**

If migrating entirely to `jose` isn’t feasible immediately:

- Use `jose` for new code, especially in Edge-compatible routes.
- Plan to replace `jsonwebtoken` in older code incrementally.

### **6. Removing `jsonwebtoken`**

Once the migration is complete, remove `jsonwebtoken` from your `package.json`:

```bash
npm uninstall jsonwebtoken
npm uninstall @types/jsonwebtoken
```

### **7. When to Keep Both**

The only valid reason to use both libraries would be:

- Legacy code relies on `jsonwebtoken`, and refactoring it is currently impractical.
- New parts of the project require Edge compatibility, where `jose` is used.
