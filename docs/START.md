# Getting Started with Disco

## Target Setup

This guide will help you set up the Disco development environment.
When properly configured, you'll have:

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

## Docker Status

### Complete Components:
- Main compose files:
  - `backend/docker-compose.yml` - All services defined
  - `backend/docker-compose.override.yml` - Development overrides
- Service Dockerfiles:
  - `core-api/Dockerfile`
  - `location-service/Dockerfile`
  - `matching-service/Dockerfile` 
  - `user-service/Dockerfile`

### Missing Components:
1. Environment Files:
   - Service-specific .env files
   - Environment variable configurations

2. Go Dependencies:
   - Missing go.mod/go.sum in some services
   - Need to run `go mod init/tidy`

3. Service Configs:
   - Redis configuration files
   - Service-specific configs

### Action Items:
1. Create environment files for each service
2. Initialize Go modules where missing
3. Add required config files
4. Test full docker-compose stack

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


   # troubleshooting
   After making updates, running docker-compose build first before docker-compose up ensures a fresh build and helps diagnose any remaining issues.

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

## Shutting Down the Development Environment

When you're done working or need to shut down for the night, follow these steps in order:

### 1. Stop Frontend Services

1. Stop the Next.js development server:
   - Press `Ctrl+C` in the terminal where Next.js is running
   - Wait for the process to fully terminate

### 2. Stop Backend Services

1. Stop all Go services in any order:

   - Press `Ctrl+C` in each terminal running a Go service:
     - Core API Service
     - Location Service
     - Matching Service
     - User Service
   - Wait for each process to exit cleanly

2. Verify no Go processes are still running:
   ```bash
   ps aux | grep go
   ```
   Kill any remaining processes if necessary:
   ```bash
   pkill -f "go run"
   ```

### 3. Stop Infrastructure Services

1. Stop Docker containers:

   ```bash
   cd backend
   docker compose down
   ```

   This will:

   - Stop and remove all containers (PostgreSQL, Redis)
   - Remove the Docker network
   - Preserve your data volumes

2. Verify all containers are stopped:
   ```bash
   docker ps
   ```
   Should show no running containers.

### 4. Optional: Clean Up (if needed)

1. Remove unused Docker resources:

   ```bash
   docker system prune
   ```

   This removes:

   - Stopped containers
   - Unused networks
   - Dangling images
   - Build cache

2. Clear Node.js cache (if experiencing issues):

   ```bash
   npm cache clean --force
   ```

3. Remove development build artifacts:
   ```bash
   # In root directory
   rm -rf .next
   # In backend services
   cd backend/services
   find . -name "tmp" -type d -exec rm -rf {} +
   ```

### 5. Verify Clean Shutdown

1. Check for any remaining processes:

   ```bash
   # Check for Node processes
   ps aux | grep node
   # Check for Go processes
   ps aux | grep go
   # Check for Docker containers
   docker ps
   ```

2. Check system ports:
   ```bash
   # Check if main ports are free
   lsof -i :3000  # Next.js
   lsof -i :8080  # Core API
   lsof -i :5432  # PostgreSQL
   lsof -i :6379  # Redis
   ```

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

- If containers won't stop:
  ```bash
  # Force stop containers
  docker compose down -v --remove-orphans
  # If still running
  docker kill $(docker ps -q)
  ```

### Process Issues

- If a service won't stop with Ctrl+C:

  ```bash
  # For Node.js
  pkill -f "node"
  # For Go
  pkill -f "go run"
  ```

- If ports are in use:
  ```bash
  # Find process using a port
  lsof -i :<port>
  # Kill process
  kill -9 <PID>
  ```

### Database Issues

- If PostgreSQL won't start:
  ```bash
  # Remove PostgreSQL volume and recreate
  docker compose down -v
  docker compose up -d postgres
  # Rerun migrations
  cd backend/services/core-api
  go run cmd/migrate/main.go up
  ```

Remember to always shut down services in the correct order to prevent data corruption or orphaned processes.

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
