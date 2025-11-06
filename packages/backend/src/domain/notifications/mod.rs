//! Доменная модель уведомлений

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

// ============================================================================
// СТРУКТУРЫ ДАННЫХ
// ============================================================================

/// Модель уведомления
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Notification {
    /// Идентификатор
    pub id: Option<i64>,
    /// Наименование
    pub name: String,
    /// Содержимое
    pub content: String,
    /// Дата создания уведомления
    pub created_at: Option<DateTime<Utc>>,
}

// ============================================================================
// РЕАЛИЗАЦИЯ МЕТОДОВ
// ============================================================================

impl Notification {
    /// Создаёт новое уведомление в базе данных
    pub async fn create(&self, pool: &PgPool) -> Result<i64, sqlx::Error> {
        let result = sqlx::query!(
            "INSERT INTO notification (name, content) VALUES ($1, $2) RETURNING id",
            self.name,
            self.content
        )
        .fetch_one(pool)
        .await?;

        Ok(result.id)
    }

    /// Получает все уведомления из базы данных
    pub async fn find_all(pool: &PgPool) -> Result<Vec<Notification>, sqlx::Error> {
        let notifications = sqlx::query_as!(
            Notification,
            "SELECT id, name, content, created_at FROM notification ORDER BY created_at DESC"
        )
        .fetch_all(pool)
        .await?;

        Ok(notifications)
    }

    /// Находит уведомление по имени
    pub async fn find_by_name(
        name: &str,
        pool: &PgPool,
    ) -> Result<Option<Notification>, sqlx::Error> {
        let notification = sqlx::query_as!(
            Notification,
            "SELECT id, name, content, created_at FROM notification WHERE name = $1",
            name
        )
        .fetch_optional(pool)
        .await?;

        Ok(notification)
    }

    /// Находит уведомление по ID
    pub async fn find_by_id(id: i64, pool: &PgPool) -> Result<Option<Notification>, sqlx::Error> {
        let notification = sqlx::query_as!(
            Notification,
            "SELECT id, name, content, created_at FROM notification WHERE id = $1",
            id
        )
        .fetch_optional(pool)
        .await?;

        Ok(notification)
    }

    /// Обновляет уведомление в базе данных
    pub async fn update(&self, pool: &PgPool) -> Result<(), sqlx::Error> {
        if let Some(id) = self.id {
            sqlx::query!(
                "UPDATE notification SET name = $1, content = $2 WHERE id = $3",
                self.name,
                self.content,
                id
            )
            .execute(pool)
            .await?;
        }

        Ok(())
    }

    /// Удаляет уведомление по ID
    pub async fn delete(id: i64, pool: &PgPool) -> Result<(), sqlx::Error> {
        sqlx::query!("DELETE FROM notification WHERE id = $1", id)
            .execute(pool)
            .await?;

        Ok(())
    }

    /// Создает новое уведомление с валидацией
    pub fn new(name: String, content: String) -> Result<Self, String> {
        if name.is_empty() {
            return Err("Название уведомления не может быть пустым".to_string());
        }

        if name.len() > 100 {
            return Err("Название уведомления не может быть длиннее 100 символов".to_string());
        }

        if content.is_empty() {
            return Err("Содержимое уведомления не может быть пустым".to_string());
        }

        Ok(Notification {
            id: None,
            name,
            content,
            created_at: None,
        })
    }
}
