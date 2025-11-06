-- Spark Package Registry and Remote Units System

-- Create packages table (projects available for installation)
CREATE TABLE IF NOT EXISTS spark_packages (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    author_id BIGINT NOT NULL,
    project_id BIGINT,
    repository TEXT, -- git repository URL
    category TEXT, -- биомедицина, фотоника, etc
    is_public BOOLEAN NOT NULL DEFAULT false,
    downloads BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id),
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL
);

-- Create package versions table
CREATE TABLE IF NOT EXISTS spark_package_versions (
    id BIGSERIAL PRIMARY KEY,
    package_id BIGINT NOT NULL,
    version TEXT NOT NULL,
    changelog TEXT,
    download_url TEXT,
    checksum TEXT,
    size_bytes BIGINT,
    is_stable BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES spark_packages (id) ON DELETE CASCADE,
    UNIQUE(package_id, version)
);

-- Create package dependencies table
CREATE TABLE IF NOT EXISTS spark_package_dependencies (
    id BIGSERIAL PRIMARY KEY,
    package_version_id BIGINT NOT NULL,
    dependency_name TEXT NOT NULL,
    version_constraint TEXT NOT NULL, -- e.g. ">=1.0.0", "^2.3.0"
    FOREIGN KEY (package_version_id) REFERENCES spark_package_versions (id) ON DELETE CASCADE
);

-- Create remote units table (running instances on user devices)
CREATE TABLE IF NOT EXISTS spark_remote_units (
    id BIGSERIAL PRIMARY KEY,
    unit_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    package_id BIGINT NOT NULL,
    package_version_id BIGINT NOT NULL,
    owner_id BIGINT NOT NULL,
    device_name TEXT, -- hostname of device
    device_os TEXT, -- OS type (linux, macos, windows)
    status TEXT NOT NULL CHECK(status IN ('starting', 'running', 'stopped', 'failed', 'paused')) DEFAULT 'stopped',
    pid INTEGER, -- process ID on remote device
    port INTEGER, -- listening port if applicable
    started_at TIMESTAMPTZ,
    stopped_at TIMESTAMPTZ,
    last_heartbeat TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES spark_packages (id),
    FOREIGN KEY (package_version_id) REFERENCES spark_package_versions (id),
    FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create unit telemetry table (metrics and logs from units)
CREATE TABLE IF NOT EXISTS spark_unit_telemetry (
    id BIGSERIAL PRIMARY KEY,
    unit_id UUID NOT NULL,
    telemetry_type TEXT NOT NULL CHECK(telemetry_type IN ('log', 'metric', 'event', 'error')),
    level TEXT CHECK(level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    message TEXT,
    data JSONB, -- structured data (metrics, custom fields)
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES spark_remote_units (unit_id) ON DELETE CASCADE
);

-- Create user package installations table
CREATE TABLE IF NOT EXISTS spark_user_installations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    package_version_id BIGINT NOT NULL,
    install_path TEXT,
    installed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES spark_packages (id) ON DELETE CASCADE,
    FOREIGN KEY (package_version_id) REFERENCES spark_package_versions (id),
    UNIQUE(user_id, package_id)
);

-- Create package tags table
CREATE TABLE IF NOT EXISTS spark_package_tags (
    id BIGSERIAL PRIMARY KEY,
    package_id BIGINT NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (package_id) REFERENCES spark_packages (id) ON DELETE CASCADE,
    UNIQUE(package_id, tag)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_spark_packages_name ON spark_packages (name);
CREATE INDEX IF NOT EXISTS idx_spark_packages_category ON spark_packages (category);
CREATE INDEX IF NOT EXISTS idx_spark_packages_author ON spark_packages (author_id);
CREATE INDEX IF NOT EXISTS idx_spark_package_versions_package ON spark_package_versions (package_id);
CREATE INDEX IF NOT EXISTS idx_spark_remote_units_owner ON spark_remote_units (owner_id);
CREATE INDEX IF NOT EXISTS idx_spark_remote_units_status ON spark_remote_units (status);
CREATE INDEX IF NOT EXISTS idx_spark_remote_units_unit_id ON spark_remote_units (unit_id);
CREATE INDEX IF NOT EXISTS idx_spark_unit_telemetry_unit ON spark_unit_telemetry (unit_id);
CREATE INDEX IF NOT EXISTS idx_spark_unit_telemetry_timestamp ON spark_unit_telemetry (timestamp);
CREATE INDEX IF NOT EXISTS idx_spark_unit_telemetry_type ON spark_unit_telemetry (telemetry_type);
CREATE INDEX IF NOT EXISTS idx_spark_user_installations_user ON spark_user_installations (user_id);
