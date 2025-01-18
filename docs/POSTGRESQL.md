# PostgreSQL Setup Guide for Disco

This guide will help you set up PostgreSQL for the Disco project on macOS.

## Prerequisites

- macOS 12.x or later
- Homebrew package manager
- Terminal access

## Installation

### 1. Install PostgreSQL

First, ensure Homebrew is up to date:

```bash
brew update
```

Then install PostgreSQL:

```bash
brew install postgresql@17
```

### 2. Start PostgreSQL Service

Start the PostgreSQL service using Homebrew:

```bash
brew services start postgresql
```

To verify the service is running:

```bash
brew services list | grep postgresql
```

### 3. Verify Installation

Check your PostgreSQL version:

```bash
psql --version
```

You should see output like: `psql (PostgreSQL) 17.x`

## Project Setup

### 1. Create Environment Variables

Create a `.env` file in the project root directory with the following content:

```bash
# Database connection URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/disco?schema=public"

# JWT secret for authentication
JWT_SECRET="your-secure-secret-key-here"
```

Replace `your-secure-secret-key-here` with a strong secret key for JWT token encryption.

### 2. Create Database

Create a new database for the project:

```bash
createdb disco
```

### 3. Initialize Database Schema

Run Prisma migrations to set up the database schema:

```bash
# Install dependencies if you haven't already
npm install

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev
```

## Common PostgreSQL Commands

### Database Management

```bash
# List all databases
\l

# Connect to disco database
psql disco

# Create a new database
createdb database_name

# Drop a database
dropdb database_name
```

### Inside psql

```sql
-- List all tables
\dt

-- Describe a table
\d table_name

-- List all users
\du

-- Quit psql
\q
```

## Troubleshooting

### Common Issues

1. **Service Won't Start**

   ```bash
   # Stop the service
   brew services stop postgresql

   # Start it again
   brew services start postgresql
   ```

2. **Permission Issues**

   ```bash
   # Create a superuser role
   createuser -s postgres
   ```

3. **Port Conflicts**
   Check if something is using port 5432:
   ```bash
   lsof -i :5432
   ```

### Database Reset

If you need to reset the database:

```bash
# Drop the database
dropdb disco

# Recreate it
createdb disco

# Run migrations again
npx prisma migrate reset
```

## Best Practices

1. **Regular Backups**

   ```bash
   # Backup database
   pg_dump disco > backup.sql

   # Restore from backup
   psql disco < backup.sql
   ```

2. **Connection Pooling**

   - Use connection pooling in production
   - Configure max connections based on your resources
   - Monitor active connections

3. **Security**
   - Use strong passwords
   - Limit network access
   - Keep PostgreSQL updated
   - Regularly audit user permissions

## Additional Resources

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [Prisma with PostgreSQL Guide](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases-typescript-postgresql)
- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/security.html)

Once connected to your `disco` database via PostgreSQL 15, here are some quick tips to get started:

### Common Commands:

1. **View Tables**:

   ```sql
   \dt
   ```

   (Shows all tables in the current database.)

2. **Describe a Table**:

   ```sql
   \d table_name
   ```

   (Replace `table_name` with your table's name to see its schema.)

3. **Run SQL Queries**:

   ```sql
   SELECT * FROM your_table_name;
   ```

   (Retrieve all rows from a specific table.)

4. **Create a Table**:

   ```sql
   CREATE TABLE example (
       id SERIAL PRIMARY KEY,
       name VARCHAR(100),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. **Insert Data**:

   ```sql
   INSERT INTO example (name) VALUES ('Sample Data');
   ```

6. **Exit psql**:
   ```sql
   \q
   ```
