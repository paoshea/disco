# Getting Started with Disco

## Target Setup

This guide will help you set up the Disco development environment. When properly configured, you'll have:

1. **Infrastructure Services** (running in Docker):

   - PostgreSQL database
   - Redis cache
   - Container name in Docker Desktop: `backend`

2. **Backend Services**:

   - Core API running locally at http://localhost:8080
   - Health check available at http://localhost:8080/health
   - API endpoints served through both:
     - Next.js API routes (`app/api/*`)
     - Go backend services

3. **Frontend Development**:
   - Next.js development server at http://localhost:3000
   - Live reload enabled for immediate feedback
   - Full TypeScript support

This setup enables you to:

- Develop and test the frontend with live updates
- Access API endpoints through Next.js routes or the Go backend
- Maintain data persistence with PostgreSQL
- Utilize Redis for caching and real-time features

## Prerequisites

Make sure you have the following installed:

- Node.js (v18 or higher)
- Docker Desktop
- Go (v1.19 or higher)
- Git

## Step 1: Environment Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone <repository-url>
   cd Disco
   npm install
   ```

2. Copy the example environment file and configure it:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

## Step 2: Start Docker Services

1. Start Docker Desktop on your machine

   - On Mac: Open Docker Desktop application
   - On Windows: Start Docker Desktop from the Start menu
   - Wait until Docker Desktop shows "Running"
   - If another project is running, see [Switching Between Projects](#switching-between-projects) section

2. Start the database and other containerized services:

   ```bash
   cd backend
   docker compose -f docker-compose.yml -f docker-compose.override.yml up -d postgres redis
   ```

   This will start:

   - PostgreSQL database
   - Redis cache
     The container will be named `backend` in Docker Desktop.

3. Verify containers are running:
   ```bash
   docker ps
   ```
   You should see containers with names like `backend-postgres-1` and `backend-redis-1`.

## Step 3: Start Backend Services

The backend consists of several microservices written in Go. Start them in this order:

1. Core API Service:

   ```bash
   cd backend/services/core-api
   go mod tidy  # Install/update dependencies
   go run main.go
   ```

   Keep this terminal window open.

2. Location Service (in a new terminal):

   ```bash
   cd backend/services/location-service
   go mod tidy
   go run main.go
   ```

3. Matching Service (in a new terminal):

   ```bash
   cd backend/services/matching-service
   go mod tidy
   go run main.go
   ```

4. User Service (in a new terminal):
   ```bash
   cd backend/services/user-service
   go mod tidy
   go run main.go
   ```

## Step 4: Database Setup

1. Run database migrations:

   ```bash
   cd backend/services/core-api
   go run cmd/migrate/main.go up
   ```

2. Seed initial data (if needed):
   ```bash
   go run cmd/seed/main.go
   ```

## Step 5: Start Frontend Development Server

You can either run the development server or build for production:

### Development Mode

```bash
# In the root directory
npm run dev
```

The application will be available at http://localhost:3000 with hot reloading enabled.

### Production Build

```bash
# In the root directory
npm run build
npm start
```

The application will be available at http://localhost:3000 in production mode.

## Switching Between Projects

If you have other Docker projects running, follow these steps to switch to Disco:

1. Stop and remove all running containers:

   ```bash
   docker stop $(docker ps -q)  # Stop all running containers
   docker rm $(docker ps -aq)   # Remove all containers
   ```

2. Start only the essential services for Disco:

   ```bash
   cd backend
   docker compose -f docker-compose.yml -f docker-compose.override.yml up -d postgres redis
   ```

   This will create a container named `backend` in Docker Desktop.

3. Verify the correct services are running:

   ```bash
   docker ps
   ```

   You should see only the Postgres and Redis containers for the Disco project.

4. Start the development services locally:
   - Core API: `cd backend/services/core-api && go run main.go`
   - Frontend: `npm run dev` (in the root directory)

This approach of running only essential services in Docker and other services locally makes development and debugging easier.

## Troubleshooting

### Docker Issues

- If containers fail to start, try:
  ```bash
  docker compose down
  docker compose -f docker-compose.yml -f docker-compose.override.yml up -d
  ```

### Database Issues

- If migrations fail, check if PostgreSQL is running:
  ```bash
  docker ps | grep postgres
  ```
- Reset the database if needed:
  ```bash
  docker compose down -v
  docker compose up -d
  ```

### Go Services Issues

- If a Go service fails to start, check:
  1. Port conflicts (make sure no other service is using the same port)
  2. Database connection (verify PostgreSQL is running)
  3. Environment variables (check .env file)

### Frontend Issues

- Clear node_modules and reinstall:
  ```bash
  rm -rf node_modules
  npm install
  ```
- Clear Next.js cache:
  ```bash
  rm -rf .next
  npm run build
  ```

## Development Workflow

1. Start Docker services first
2. Start all Go backend services
3. Start the frontend development server
4. Make changes to the code
5. Use `npm run type-check` to verify TypeScript
6. Run `npm run lint` to check for code style issues

## Additional Commands

- Format code:
  ```bash
  npm run format
  ```
- Type check:
  ```bash
  npm run type-check
  ```
- Lint:
  ```bash
  npm run lint
  ```
- Verify environment variables:
  ```bash
  npm run verify-env
  ```

## Architecture Overview

The application uses:

- Next.js 13+ with App Router for the frontend
- Go microservices for backend functionality
- PostgreSQL for data storage
- Redis for caching
- Docker for containerization

Each component is designed to work independently, making it easier to debug and maintain.

## Need Help?

If you encounter any issues:

1. Check the logs of the specific service
2. Verify all required services are running
3. Consult the troubleshooting section above
4. Check the project documentation in the `/docs` directory
