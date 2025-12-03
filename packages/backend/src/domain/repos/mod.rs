//! Доменная модель репозитория

use crate::utils::git;
use chrono::{DateTime, Utc};
use log::error;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

// ============================================================================
// СТРУКТУРЫ ДАННЫХ
// ============================================================================

/// Модель репозитория Git
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Repository {
    /// Идентификатор репозитория
    pub id: Option<i64>,
    /// Название репозитория
    pub name: String,
    /// Идентификатор проекта
    pub project_id: i64,
    /// Идентификатор владельца репозитория
    pub owner_id: i64,
    /// Описание репозитория
    pub description: Option<String>,
    /// Флаг публичности репозитория
    pub is_public: bool,
    /// Дата создания репозитория
    pub created_at: Option<DateTime<Utc>>,
}

// ============================================================================
// РЕАЛИЗАЦИЯ МЕТОДОВ
// ============================================================================

impl Repository {
    /// Создаёт новый репозиторий в базе данных и на диске
    ///
    /// # Параметры
    ///
    /// * `pool` - Пул подключений к базе данных
    ///
    /// # Возвращает
    ///
    /// * `Result<i64, sqlx::Error>` - ID созданного репозитория
    pub async fn create(&self, pool: &PgPool) -> Result<i64, sqlx::Error> {
        // Добавляем репозиторий в базу данных
        let result = sqlx::query!(
            "INSERT INTO repositories (name, project_id, owner_id, description, is_public) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id",
            self.name,
            self.project_id,
            self.owner_id,
            self.description,
            self.is_public
        )
        .fetch_one(pool)
        .await?;

        let repo_id = result.id;

        // Создаём репозиторий на диске
        let repo_path = format!("repositories/{}.git", self.name);

        // Используем функцию из utils::git для создания репозитория
        if let Err(e) = git::create_bare_repository(&repo_path) {
            error!("Не удалось создать репозиторий: {}", e);
            // Note: In a real scenario, we might want to rollback the DB insert here
        }

        Ok(repo_id)
    }

    /// Получает список репозиториев пользователя
    ///
    /// # Параметры
    ///
    /// * `owner_id` - ID пользователя
    /// * `pool` - Пул подключений к базе данных
    ///
    /// # Возвращает
    ///
    /// * `Result<Vec<Repository>, sqlx::Error>` - Список репозиториев
    pub async fn find_by_owner(
        owner_id: i64,
        pool: &PgPool,
    ) -> Result<Vec<Repository>, sqlx::Error> {
        let repos = sqlx::query_as!(
            Repository,
            "SELECT id, name, project_id, owner_id, description, is_public, created_at 
             FROM repositories WHERE owner_id = $1",
            owner_id
        )
        .fetch_all(pool)
        .await?;

        Ok(repos)
    }

    /// Находит репозиторий по имени
    ///
    /// # Параметры
    ///
    /// * `name` - Имя репозитория
    /// * `pool` - Пул подключений к базе данных
    ///
    /// # Возвращает
    ///
    /// * `Result<Option<Repository>, sqlx::Error>` - Найденный репозиторий или None
    pub async fn find_by_name(
        name: &str,
        pool: &PgPool,
    ) -> Result<Option<Repository>, sqlx::Error> {
        let repo = sqlx::query_as!(
            Repository,
            "SELECT id, name, project_id, owner_id, description, is_public, created_at 
             FROM repositories WHERE name = $1",
            name
        )
        .fetch_optional(pool)
        .await?;

        Ok(repo)
    }

    /// Получает список репозиториев проекта
    ///
    /// # Параметры
    ///
    /// * `project_id` - ID проекта
    /// * `pool` - Пул подключений к базе данных
    ///
    /// # Возвращает
    ///
    /// * `Result<Vec<Repository>, sqlx::Error>` - Список репозиториев
    pub async fn find_by_project(
        project_id: i64,
        pool: &PgPool,
    ) -> Result<Vec<Repository>, sqlx::Error> {
        let repos = sqlx::query_as!(
            Repository,
            "SELECT id, name, project_id, owner_id, description, is_public, created_at 
             FROM repositories WHERE project_id = $1",
            project_id
        )
        .fetch_all(pool)
        .await?;

        Ok(repos)
    }

    /// Находит репозиторий по имени и проекту
    ///
    /// # Параметры
    ///
    /// * `name` - Имя репозитория
    /// * `project_id` - ID проекта
    /// * `pool` - Пул подключений к базе данных
    ///
    /// # Возвращает
    ///
    /// * `Result<Option<Repository>, sqlx::Error>` - Найденный репозиторий или None
    pub async fn find_by_name_and_project(
        name: &str,
        project_id: i64,
        pool: &PgPool,
    ) -> Result<Option<Repository>, sqlx::Error> {
        let repo = sqlx::query_as!(
            Repository,
            "SELECT id, name, project_id, owner_id, description, is_public, created_at 
             FROM repositories WHERE name = $1 AND project_id = $2",
            name,
            project_id
        )
        .fetch_optional(pool)
        .await?;

        Ok(repo)
    }

    /// Создает новый репозиторий с валидацией
    pub fn new(
        name: String,
        project_id: i64,
        owner_id: i64,
        description: Option<String>,
        is_public: bool,
    ) -> Result<Self, String> {
        if name.is_empty() {
            return Err("Имя репозитория не может быть пустым".to_string());
        }

        if name.len() < 2 {
            return Err("Имя репозитория должно содержать минимум 2 символа".to_string());
        }

        if name.len() > 100 {
            return Err("Имя репозитория не может быть длиннее 100 символов".to_string());
        }

        // Проверка на допустимые символы в имени
        if !name
            .chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '-' || c == '.')
        {
            return Err("Имя репозитория может содержать только буквы, цифры, точки, дефисы и подчеркивания".to_string());
        }

        Ok(Repository {
            id: None,
            name,
            project_id,
            owner_id,
            description,
            is_public,
            created_at: None,
        })
    }
}
