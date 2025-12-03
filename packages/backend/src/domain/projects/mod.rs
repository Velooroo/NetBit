//! Доменная модель проекта

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    pub id: Option<i64>,
    pub name: String,
    pub owner_id: i64,
    pub description: Option<String>,
    pub is_public: bool,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct ProjectConfig {
    pub metadata: ProjectMetadata,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct ProjectMetadata {
    pub tags: Vec<String>,
}

impl ProjectConfig {
    pub async fn save(&self, project_id: i64, pool: &PgPool) -> Result<(), sqlx::Error> {
        let config_json = serde_json::to_string(self).map_err(|_| {
            sqlx::Error::Decode(Box::new(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                "Failed to serialize",
            )))
        })?;

        sqlx::query!(
            "INSERT INTO project_configs (project_id, config_json)
             VALUES ($1, $2)
             ON CONFLICT (project_id) DO UPDATE SET config_json = $2, updated_at = CURRENT_TIMESTAMP",
            project_id,
            config_json
        )
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn load(project_id: i64, pool: &PgPool) -> Result<ProjectConfig, sqlx::Error> {
        let result = sqlx::query!(
            "SELECT config_json FROM project_configs WHERE project_id = $1",
            project_id
        )
        .fetch_optional(pool)
        .await?;

        if let Some(row) = result {
            serde_json::from_str(&row.config_json).map_err(|_| {
                sqlx::Error::Decode(Box::new(std::io::Error::new(
                    std::io::ErrorKind::InvalidData,
                    "Failed to deserialize",
                )))
            })
        } else {
            Ok(ProjectConfig::default())
        }
    }
}

impl Project {
    pub async fn create(&self, pool: &PgPool) -> Result<i64, sqlx::Error> {
        let result = sqlx::query!(
            "INSERT INTO projects (name, owner_id, description, is_public)
             VALUES ($1, $2, $3, $4) RETURNING id",
            self.name,
            self.owner_id,
            self.description,
            self.is_public
        )
        .fetch_one(pool)
        .await?;

        Ok(result.id)
    }

    pub async fn get_config(&self, pool: &PgPool) -> Result<ProjectConfig, sqlx::Error> {
        if let Some(project_id) = self.id {
            ProjectConfig::load(project_id, pool).await
        } else {
            Ok(ProjectConfig::default())
        }
    }

    pub async fn update_config(
        &self,
        config: &ProjectConfig,
        pool: &PgPool,
    ) -> Result<(), sqlx::Error> {
        if let Some(project_id) = self.id {
            config.save(project_id, pool).await
        } else {
            Err(sqlx::Error::RowNotFound)
        }
    }

    pub async fn find_by_owner(owner_id: i64, pool: &PgPool) -> Result<Vec<Project>, sqlx::Error> {
        let projects = sqlx::query!(
            "SELECT id, name, owner_id, description, is_public, created_at
             FROM projects WHERE owner_id = $1",
            owner_id
        )
        .fetch_all(pool)
        .await?
        .into_iter()
        .map(|row| Project {
            id: Some(row.id),
            name: row.name,
            owner_id: row.owner_id,
            description: row.description,
            is_public: row.is_public,
            created_at: row.created_at,
        })
        .collect();

        Ok(projects)
    }

    pub async fn find_by_name(name: &str, pool: &PgPool) -> Result<Option<Project>, sqlx::Error> {
        let project = sqlx::query!(
            "SELECT id, name, owner_id, description, is_public, created_at
             FROM projects WHERE name = $1",
            name
        )
        .fetch_optional(pool)
        .await?
        .map(|row| Project {
            id: Some(row.id),
            name: row.name,
            owner_id: row.owner_id,
            description: row.description,
            is_public: row.is_public,
            created_at: row.created_at,
        });

        Ok(project)
    }

    pub async fn find_by_name_and_owner(
        name: &str,
        owner_id: i64,
        pool: &PgPool,
    ) -> Result<Option<Project>, sqlx::Error> {
        let project = sqlx::query!(
            "SELECT id, name, owner_id, description, is_public, created_at
             FROM projects WHERE name = $1 AND owner_id = $2",
            name,
            owner_id
        )
        .fetch_optional(pool)
        .await?
        .map(|row| Project {
            id: Some(row.id),
            name: row.name,
            owner_id: row.owner_id,
            description: row.description,
            is_public: row.is_public,
            created_at: row.created_at,
        });

        Ok(project)
    }

    pub async fn find_public(pool: &PgPool) -> Result<Vec<Project>, sqlx::Error> {
        let projects = sqlx::query!(
            "SELECT id, name, owner_id, description, is_public, created_at
             FROM projects WHERE is_public = true"
        )
        .fetch_all(pool)
        .await?
        .into_iter()
        .map(|row| Project {
            id: Some(row.id),
            name: row.name,
            owner_id: row.owner_id,
            description: row.description,
            is_public: row.is_public,
            created_at: row.created_at,
        })
        .collect();

        Ok(projects)
    }

    pub fn new(
        name: String,
        owner_id: i64,
        description: Option<String>,
        is_public: bool,
    ) -> Result<Self, String> {
        if name.is_empty() {
            return Err("Project name cannot be empty".to_string());
        }

        if name.len() < 2 {
            return Err("Project name must be at least 2 characters".to_string());
        }

        if name.len() > 100 {
            return Err("Project name cannot exceed 100 characters".to_string());
        }

        Ok(Project {
            id: None,
            name,
            owner_id,
            description,
            is_public,
            created_at: None,
        })
    }
}
