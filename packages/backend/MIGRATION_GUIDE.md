# PostgreSQL Migration Guide

## Overview

The backend has been migrated from SQLite (rusqlite) to PostgreSQL (sqlx). This migration includes:

- **Database**: Migrated from SQLite to PostgreSQL
- **ORM**: Changed from rusqlite to sqlx (async)
- **Password Security**: Implemented bcrypt password hashing (removed plaintext)
- **Connection Pool**: Using PgPool instead of Arc<Mutex<Connection>>
- **Automatic Migrations**: Database schema migrations run automatically on startup

## Prerequisites

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### 2. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE netbit;
CREATE USER netbit_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE netbit TO netbit_user;

# Exit psql
\q
```

## Configuration

### Environment Variables

Create a `.env` file in `packages/backend/` with:

```env
# Database Configuration
DATABASE_URL=postgresql://netbit_user:your_secure_password@localhost/netbit

# Server Configuration
HOST=0.0.0.0
PORT=8000

# Security
JWT_SECRET=your-secret-key-change-in-production

# Paths
REPOSITORIES_PATH=repositories
```

**Important**: Never commit the `.env` file. It's already in `.gitignore`.

### Default Configuration

If environment variables are not set, the following defaults are used:

- **HOST**: `0.0.0.0`
- **PORT**: `8000`
- **DATABASE_URL**: `postgresql://postgres:postgres@localhost/netbit`
- **JWT_SECRET**: `your-secret-key-change-in-production` (⚠️ Change in production!)
- **REPOSITORIES_PATH**: `repositories`

## Database Migrations

Migrations are located in `packages/backend/migrations/` and run automatically on server startup.

### Initial Migration (001_initial_schema.sql)

Creates the following tables:
- `users` - User accounts with bcrypt-hashed passwords
- `projects` - Project metadata
- `project_configs` - Project configurations (JSON)
- `repositories` - Git repository metadata
- `notification` - System notifications
- `chats` - Chat rooms
- `chat_participants` - Chat membership
- `messages` - Chat messages

### Manual Migration Management

If needed, you can manage migrations manually:

```bash
# Install sqlx-cli
cargo install sqlx-cli --no-default-features --features postgres

# Run migrations
cd packages/backend
sqlx migrate run

# Revert last migration
sqlx migrate revert

# Create new migration
sqlx migrate add <migration_name>
```

## Building the Project

### Development Build

```bash
cd packages/backend
cargo build
```

### Running with Query Cache

sqlx uses compile-time checked queries. To build without a database connection:

```bash
# Generate query cache (requires DATABASE_URL)
export DATABASE_URL=postgresql://netbit_user:password@localhost/netbit
cargo sqlx prepare

# Now you can build offline
SQLX_OFFLINE=true cargo build
```

### Production Build

```bash
cd packages/backend
cargo build --release
```

## Running the Server

```bash
cd packages/backend

# Set environment variables (or use .env file)
export DATABASE_URL=postgresql://netbit_user:password@localhost/netbit
export JWT_SECRET=your-production-secret

# Run the server
cargo run

# Or run the release build
./target/release/git-server-backend
```

The server will:
1. Connect to PostgreSQL
2. Run database migrations automatically
3. Start listening on configured host:port

## API Changes

### Authentication

#### Password Hashing

Passwords are now hashed using bcrypt with cost factor 12. When creating or updating users:

```json
{
  "username": "user",
  "password": "plaintext_password", 
  "email": "user@example.com"
}
```

The password is automatically hashed before storage.

#### Authentication Flow

1. **Register** - `POST /api/auth/register`
   - Password is hashed with bcrypt
   - User stored in database

2. **Login** - `POST /api/auth/login`
   - Password is verified against bcrypt hash
   - JWT token returned on success

3. **Protected Endpoints** - Include JWT token:
   ```
   Authorization: Bearer <jwt_token>
   ```

### Breaking Changes

- **Database Connection**: Must use PostgreSQL (SQLite no longer supported)
- **Password Field**: Changed from `password` to `password_hash` in database
- **All Operations**: Now async (use `.await`)
- **Connection Method**: Changed from `db.get_connection()` to `db.get_pool()`

## Troubleshooting

### Connection Errors

**Error**: `Failed to connect to database`

**Solution**: Verify PostgreSQL is running and DATABASE_URL is correct:
```bash
psql "$DATABASE_URL"
```

### Migration Errors

**Error**: `Failed to run migrations`

**Solution**: Check migration files and database permissions:
```bash
# Verify migrations
ls packages/backend/migrations/

# Check database access
psql "$DATABASE_URL" -c "SELECT version();"
```

### Build Errors

**Error**: `set DATABASE_URL to use query macros online`

**Solution**: Either:
1. Set DATABASE_URL environment variable
2. Generate query cache: `cargo sqlx prepare`
3. Build with offline mode: `SQLX_OFFLINE=true cargo build`

### Password Authentication Fails

**Issue**: Old SQLite users cannot login

**Reason**: Passwords were stored in plaintext in SQLite, now use bcrypt hashes.

**Solution**: Users need to re-register or reset passwords.

## Testing

### Unit Tests

```bash
cd packages/backend
cargo test
```

### Integration Tests

Requires a test database:

```bash
# Create test database
createdb netbit_test

# Set test DATABASE_URL
export DATABASE_URL=postgresql://postgres:postgres@localhost/netbit_test

# Run tests
cargo test -- --test-threads=1
```

## Security Considerations

1. **JWT Secret**: Use a strong, random JWT_SECRET in production
2. **Database Password**: Use strong passwords for database users
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Configure CORS appropriately for your domains
5. **Environment Variables**: Never commit `.env` files

## Performance Notes

- **Connection Pool**: PgPool manages 5 concurrent connections by default
- **Async Operations**: All database operations are non-blocking
- **Query Caching**: sqlx caches prepared statements
- **Migrations**: Run once at startup, cached thereafter

## Rollback Guide

If you need to rollback to SQLite:

1. Checkout previous commit: `git checkout <commit-before-migration>`
2. Restore SQLite database from backup
3. Update DATABASE_URL to SQLite file path

**Note**: Data migration between PostgreSQL and SQLite requires custom scripts.

## Additional Resources

- [sqlx Documentation](https://github.com/launchbadge/sqlx)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Actix-web Documentation](https://actix.rs/)
- [bcrypt Documentation](https://docs.rs/bcrypt/)
