# Backend Architecture

This document explains the backend architecture for the NetBit project and the purpose of each module.

## Directory Structure

```
src/
├── main.rs           # Application entry point and server configuration
├── api/              # API layer - HTTP handlers and routing
│   ├── mod.rs        # Module definitions
│   ├── user.rs       # User authentication endpoints
│   ├── project.rs    # Project management endpoints
│   ├── repo.rs       # Repository endpoints (legacy)
│   ├── git.rs        # Git protocol handlers
│   ├── chat.rs       # Chat/messaging endpoints
│   └── notification.rs # Notification endpoints
├── core/             # Core infrastructure and shared services
│   ├── mod.rs        # Module definitions
│   ├── config.rs     # Application configuration
│   ├── database.rs   # Database connection management
│   ├── auth.rs       # Authentication utilities
│   └── types.rs      # Common types and structures
├── domain/           # Business logic and domain models
│   ├── mod.rs        # Module definitions
│   ├── user.rs       # User domain model and operations
│   ├── project.rs    # Project domain model and operations
│   ├── repository.rs # Repository domain model and operations
│   ├── chat.rs       # Chat domain model
│   └── notification.rs # Notification domain model
└── utils/            # Utility functions and helpers
    ├── mod.rs        # Module definitions
    ├── git.rs        # Git operations utilities
    └── helpers.rs    # General helper functions
```

## Layer Responsibilities

### API Layer (`src/api/`)
- **Purpose**: HTTP request handling, routing, and response formatting
- **Responsibilities**:
  - Parse HTTP requests and extract parameters
  - Validate input data
  - Call appropriate domain layer functions
  - Format responses (JSON, error handling)
  - Handle authentication middleware
- **Example**: `project.rs` contains endpoints like `create_project`, `list_projects`, etc.

### Core Layer (`src/core/`)
- **Purpose**: Infrastructure and cross-cutting concerns
- **Responsibilities**:
  - Database connection management
  - Configuration loading and validation
  - Authentication and authorization utilities
  - Common types and error handling
  - Logging and monitoring setup
- **Example**: `database.rs` manages SQLite connections, `auth.rs` handles JWT tokens

### Domain Layer (`src/domain/`)
- **Purpose**: Business logic and data models
- **Responsibilities**:
  - Define domain entities (User, Project, Repository)
  - Implement business rules and validations
  - Database operations (CRUD)
  - Domain-specific logic and workflows
- **Example**: `project.rs` contains the `Project` struct and methods like `create()`, `find_by_owner()`

### Utils Layer (`src/utils/`)
- **Purpose**: Utility functions and helpers
- **Responsibilities**:
  - Git operations (creating repositories, handling git commands)
  - File system utilities
  - Data validation helpers
  - Format conversion utilities
- **Example**: `git.rs` handles creating bare repositories, `helpers.rs` has validation functions

## Data Flow

1. **HTTP Request** → API Layer (parse, validate)
2. **API Layer** → Domain Layer (business logic)
3. **Domain Layer** → Core Layer (database operations)
4. **Core Layer** → Database/External Services
5. **Response** flows back through the layers

## Key Design Principles

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Dependency Direction**: API → Domain → Core (outer layers depend on inner layers)
3. **Domain-Driven Design**: Business logic is centralized in the domain layer
4. **Infrastructure Isolation**: Database and external services are abstracted in the core layer

## API Endpoints

### Current Project-Based Structure
- `GET /api/projects` - List user projects
- `POST /api/projects/create` - Create new project
- `GET /api/projects/{user}/{project}` - Get project details
- `POST /api/projects/{user}/{project}/repos/create` - Create repository in project

### Legacy Repository Endpoints (Deprecated)
- `GET /api/repos` - List repositories (use projects instead)
- `POST /api/repos/create` - Create repository (use project-based creation)

## Authentication

The backend uses JWT (JSON Web Tokens) for authentication:
- Login returns a JWT token
- All protected endpoints require `Authorization: ******` header
- User context is extracted from JWT for authorization

## Database Schema

The backend uses SQLite with the following main tables:
- `users` - User accounts
- `projects` - Project information
- `repositories` - Repository metadata (linked to projects)
- `project_configs` - Project configuration (stored as JSON)

## Future Improvements

1. **Repository Routing**: Fix the `/repos/` route issue by implementing proper project-based routing
2. **Error Handling**: Standardize error responses across all endpoints
3. **Validation**: Add comprehensive input validation
4. **Testing**: Add unit and integration tests for each layer
5. **Documentation**: Add OpenAPI/Swagger documentation for API endpoints