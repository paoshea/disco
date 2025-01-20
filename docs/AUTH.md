# Authentication Documentation

## Overview

This document details the authentication system implementation in the Disco application. 

The system uses JWT (JSON Web Tokens) with the `jose` library for token handling and implements a refresh token mechanism for enhanced security.

### Contents
The document aligns with our codebase structure and provides a single source of truth for authentication-related information. 
# Overview and dependencies
- All required packages and versions
- Core dependencies like jose, bcrypt, next-auth
# Type System
- User and auth-related types
- JWT payload interfaces
- Response types
# API Endpoints
- Detailed documentation of all auth routes
- Request/response formats
- Authentication requirements
# Implementation Details
- Token management
- API client configuration
- Auth service functionality
# Security Considerations
- Token storage strategy
- Password security
- API security measures
# Error Handling
- Common error scenarios
- Error response formats
- Status codes
# Usage Examples
- Login flow
- Protected routes
- Token refresh
# Testing and Troubleshooting
- Test scenarios
- Common issues and solutions

## Dependencies

- `jose`: JSON Web Token implementation
- `bcrypt`: Password hashing
- `next-auth`: Authentication framework for Next.js
- `axios`: HTTP client for API requests

```json
{
  "dependencies": {
    "jose": "^4.14.4",
    "bcrypt": "^5.1.1",
    "next-auth": "^4.22.1",
    "axios": "^1.4.0"
  }
}
```

## Type Definitions

### User Types (`types/user.ts`)

```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  streakCount: number;
}

export interface TokenUserPayload {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}
```

### Auth Types (`types/auth.ts`)

```typescript
import { JWTPayload } from 'jose';

export interface JoseJWTPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
}
```

## API Endpoints

### Authentication Routes

All authentication routes are prefixed with `/api/auth/`.

#### Registration
- **Endpoint**: `POST /api/auth/signup`
- **Purpose**: Create new user account
- **Request Body**:
  ```typescript
  {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }
  ```
- **Response**: `AuthResponse`

#### Login
- **Endpoint**: `POST /api/auth/login`
- **Purpose**: Authenticate user
- **Request Body**:
  ```typescript
  {
    email: string;
    password: string;
  }
  ```
- **Response**: `AuthResponse`

#### Get Current User
- **Endpoint**: `GET /api/auth/me`
- **Purpose**: Retrieve authenticated user's data
- **Auth**: Required
- **Response**: `{ user: User }`

#### Update Profile
- **Endpoint**: `PATCH /api/auth/profile`
- **Purpose**: Update user profile
- **Auth**: Required
- **Request Body**: `Partial<User>`
- **Response**: `{ user: User }`

#### Token Refresh
- **Endpoint**: `POST /api/auth/refresh`
- **Purpose**: Refresh access token
- **Auth**: Required (refresh token)
- **Response**: `{ token: string; refreshToken: string }`

#### Password Reset
- **Endpoint**: `POST /api/auth/password-reset/request`
- **Purpose**: Request password reset
- **Request Body**: `{ email: string }`

- **Endpoint**: `POST /api/auth/password-reset/reset`
- **Purpose**: Reset password with token
- **Request Body**:
  ```typescript
  {
    token: string;
    password: string;
  }
  ```

## Implementation Details

### Token Management

#### Token Generation (`lib/auth.ts`)
```typescript
const accessTokenExpiresIn = 15 * 60; // 15 minutes
const refreshTokenExpiresIn = 7 * 24 * 60 * 60; // 7 days

export const generateTokens = async (user: User) => {
  const token = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(accessTokenExpiresIn)
    .sign(secret);

  const refreshToken = await generateRefreshToken(user.id, user.email);

  return { token, refreshToken };
};
```

### API Client Configuration (`services/api/api.client.ts`)

The API client is configured to:
1. Automatically add auth tokens to requests
2. Handle token refresh
3. Queue requests during refresh
4. Redirect to login on auth failures

Key features:
- Token refresh mechanism
- Request queueing during refresh
- Automatic token header injection
- Error handling with status codes

### Auth Service (`services/api/auth.service.ts`)

The auth service provides:
1. Token management
2. User authentication
3. Profile updates
4. Password reset functionality

## Security Considerations

1. **Token Storage**
   - Access tokens stored in memory/localStorage
   - Refresh tokens stored in secure HTTP-only cookies
   - Short-lived access tokens (15 minutes)
   - Longer-lived refresh tokens (7 days)

2. **Password Security**
   - Passwords hashed with bcrypt
   - Salt rounds: 10
   - Password reset tokens: one-time use

3. **API Security**
   - CSRF protection
   - Rate limiting on auth endpoints
   - HTTP-only cookies for sensitive data
   - Secure headers configuration

## Error Handling

The system implements comprehensive error handling:

```typescript
interface ErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

// Common error scenarios:
- Invalid credentials (401)
- Token expired (401)
- Invalid token (401)
- Rate limit exceeded (429)
- Server errors (500)
```

## Usage Examples

### Login Flow
```typescript
const login = async (email: string, password: string) => {
  const response = await authService.login(email, password);
  // Tokens automatically handled by service
  return response.user;
};
```

### Protected Route Access
```typescript
const getUserProfile = async () => {
  const user = await authService.getCurrentUser();
  return user;
};
```

### Token Refresh
```typescript
// Handled automatically by API client
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      return handleTokenRefresh(error);
    }
    return Promise.reject(error);
  }
);
```

## Testing

Authentication tests are located in `__tests__/auth/`.
Key test scenarios:
1. User registration
2. Login/logout
3. Token refresh
4. Password reset
5. Profile updates

## Troubleshooting

Common issues and solutions:
1. 401 Unauthorized: Check token validity and expiration
2. 404 Not Found: Verify API route paths
3. Token refresh loops: Check refresh token handling
4. CORS issues: Verify API configuration
