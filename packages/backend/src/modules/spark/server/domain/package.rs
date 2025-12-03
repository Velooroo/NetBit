use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, FromRow};

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct SparkPackage {
    pub id: i64,
    pub name: String,
    pub display_name: String,
    pub description: Option<String>,
    pub author_id: i64,
    pub project_id: Option<i64>,
    pub repository: Option<String>,
    pub category: Option<String>,
    pub is_public: bool,
    pub downloads: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct SparkPackageVersion {
    pub id: i64,
    pub package_id: i64,
    pub version: String,
    pub changelog: Option<String>,
    pub download_url: Option<String>,
    pub checksum: Option<String>,
    pub size_bytes: Option<i64>,
    pub is_stable: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct SparkPackageDependency {
    pub id: i64,
    pub package_version_id: i64,
    pub dependency_name: String,
    pub version_constraint: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePackageRequest {
    pub name: String,
    pub display_name: String,
    pub description: Option<String>,
    pub repository: Option<String>,
    pub category: Option<String>,
    pub is_public: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateVersionRequest {
    pub version: String,
    pub changelog: Option<String>,
    pub download_url: Option<String>,
    pub is_stable: bool,
}

impl SparkPackage {
    pub async fn create(
        pool: &PgPool,
        author_id: i64,
        req: CreatePackageRequest,
    ) -> Result<Self, sqlx::Error> {
        sqlx::query_as!(
            SparkPackage,
            r#"
            INSERT INTO spark_packages (name, display_name, description, author_id, repository, category, is_public)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
            "#,
            req.name,
            req.display_name,
            req.description,
            author_id,
            req.repository,
            req.category,
            req.is_public
        )
        .fetch_one(pool)
        .await
    }

    pub async fn find_by_name(pool: &PgPool, name: &str) -> Result<Option<Self>, sqlx::Error> {
        sqlx::query_as!(
            SparkPackage,
            r#"
            SELECT * FROM spark_packages WHERE name = $1
            "#,
            name
        )
        .fetch_optional(pool)
        .await
    }

    pub async fn list_public(pool: &PgPool, limit: i64, offset: i64) -> Result<Vec<Self>, sqlx::Error> {
        sqlx::query_as!(
            SparkPackage,
            r#"
            SELECT * FROM spark_packages 
            WHERE is_public = true 
            ORDER BY downloads DESC, created_at DESC
            LIMIT $1 OFFSET $2
            "#,
            limit,
            offset
        )
        .fetch_all(pool)
        .await
    }

    pub async fn search(pool: &PgPool, query: &str, limit: i64) -> Result<Vec<Self>, sqlx::Error> {
        let search_pattern = format!("%{}%", query);
        sqlx::query_as!(
            SparkPackage,
            r#"
            SELECT * FROM spark_packages 
            WHERE is_public = true 
            AND (name ILIKE $1 OR display_name ILIKE $1 OR description ILIKE $1)
            ORDER BY downloads DESC
            LIMIT $2
            "#,
            search_pattern,
            limit
        )
        .fetch_all(pool)
        .await
    }

    pub async fn increment_downloads(pool: &PgPool, package_id: i64) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            UPDATE spark_packages SET downloads = downloads + 1 WHERE id = $1
            "#,
            package_id
        )
        .execute(pool)
        .await?;
        Ok(())
    }
}

impl SparkPackageVersion {
    pub async fn create(
        pool: &PgPool,
        package_id: i64,
        req: CreateVersionRequest,
    ) -> Result<Self, sqlx::Error> {
        sqlx::query_as!(
            SparkPackageVersion,
            r#"
            INSERT INTO spark_package_versions (package_id, version, changelog, download_url, is_stable)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            "#,
            package_id,
            req.version,
            req.changelog,
            req.download_url,
            req.is_stable
        )
        .fetch_one(pool)
        .await
    }

    pub async fn find_latest(pool: &PgPool, package_id: i64) -> Result<Option<Self>, sqlx::Error> {
        sqlx::query_as!(
            SparkPackageVersion,
            r#"
            SELECT * FROM spark_package_versions 
            WHERE package_id = $1 AND is_stable = true
            ORDER BY created_at DESC
            LIMIT 1
            "#,
            package_id
        )
        .fetch_optional(pool)
        .await
    }

    pub async fn list_by_package(pool: &PgPool, package_id: i64) -> Result<Vec<Self>, sqlx::Error> {
        sqlx::query_as!(
            SparkPackageVersion,
            r#"
            SELECT * FROM spark_package_versions 
            WHERE package_id = $1
            ORDER BY created_at DESC
            "#,
            package_id
        )
        .fetch_all(pool)
        .await
    }
}
