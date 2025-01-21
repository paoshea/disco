# Location Service

A WebSocket-based service for real-time location tracking and sharing.

## Setup

1. Install Go 1.21 or later
2. Set up environment variables in your root `.env` file:

   ```bash
   # Location Service
   LOCATION_PORT=8080
   LOCATION_REDIS_URL=localhost:6379
   LOCATION_REDIS_PASSWORD=
   ```

3. Install dependencies:

   ```bash
   go mod tidy
   ```

4. Run the service:
   ```bash
   go run main.go
   ```

## Features

- Real-time location updates via WebSocket
- Redis-based location caching
- User-specific location sharing
- Graceful shutdown handling

## WebSocket API

Connect to the WebSocket endpoint:

```
ws://localhost:8080/ws?userId=<user_id>
```

Send location updates in JSON format:

```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "accuracy": 10.0
}
```

## Environment Variables

- `LOCATION_PORT`: Server port (default: 8080)
- `LOCATION_REDIS_URL`: Redis server URL
- `LOCATION_REDIS_PASSWORD`: Redis password (if required)

# To set up the location service:

1. Navigate to the location service directory:
   bash
   cd /Users/philiposhea/Downloads/Disco/backend/services/location-service
   Initialize the Go module:
   bash
   go mod init github.com/paoshea/disco/backend/services/location-service
2. Install dependencies:
   bash
   go mod tidy
3. Create a .env file with:
   LOCATION_PORT=8080
   LOCATION_REDIS_URL=localhost:6379
   LOCATION_REDIS_PASSWORD=
4. Run the service:
   bash
   go run main.go

The service provides:

- WebSocket endpoint for real-time location updates
- Redis-based location caching
- User-specific location sharing
- Graceful shutdown handling
