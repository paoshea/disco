# API Documentation

## Overview

This document outlines the REST API endpoints available in the Disco backend service.

## Base URL

```
Production: https://api.disco.com/v1
Staging: https://api-staging.disco.com/v1
Development: http://localhost:8000/v1
```

## Authentication

All API requests require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/login

Login with email and password.

**Request:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

### Safety

#### POST /safety/alerts

Create a new safety alert.

**Request:**

```json
{
  "type": "EMERGENCY",
  "location": {
    "latitude": number,
    "longitude": number
  },
  "message": "string (optional)"
}
```

**Response:**

```json
{
  "id": "string",
  "type": "EMERGENCY",
  "status": "ACTIVE",
  "createdAt": "string (ISO date)",
  "location": {
    "latitude": number,
    "longitude": number
  }
}
```

#### GET /safety/alerts

Get all active safety alerts for the authenticated user.

**Response:**

```json
{
  "alerts": [
    {
      "id": "string",
      "type": "EMERGENCY",
      "status": "ACTIVE",
      "createdAt": "string (ISO date)",
      "location": {
        "latitude": number,
        "longitude": number
      }
    }
  ]
}
```

### Matching

#### GET /matches

Get matches for the authenticated user.

**Query Parameters:**

- `limit`: number (default: 20)
- `offset`: number (default: 0)
- `radius`: number (km, default: 50)

**Response:**

```json
{
  "matches": [
    {
      "id": "string",
      "name": "string",
      "bio": "string",
      "profileImage": "string (url)",
      "location": {
        "latitude": number,
        "longitude": number
      },
      "distance": number
    }
  ],
  "total": number,
  "hasMore": boolean
}
```

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {} (optional)
  }
}
```

Common error codes:

- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API requests are rate limited by IP and user token:

- Unauthenticated: 60 requests per minute
- Authenticated: 1000 requests per minute

Rate limit headers:

```
X-RateLimit-Limit: <max requests>
X-RateLimit-Remaining: <remaining requests>
X-RateLimit-Reset: <reset timestamp>
```

## Versioning

The API uses URL versioning (v1, v2, etc.). Breaking changes will only be introduced in new versions.

## WebSocket API

For real-time features, connect to:

```
wss://api.disco.com/v1/ws
```

Required query parameters:

- `token`: JWT token

Events:

- `safety_alert`: New safety alert
- `match_update`: Match status update
- `location_update`: User location update

## Best Practices

1. Always validate request data
2. Use appropriate HTTP methods
3. Include error handling
4. Cache responses when appropriate
5. Use pagination for list endpoints
6. Implement retry logic with exponential backoff
