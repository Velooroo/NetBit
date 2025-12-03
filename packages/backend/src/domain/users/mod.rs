//! Доменная модель пользователя

use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

// ============================================================================
// СТРУКТУРЫ ДАННЫХ
// ============================================================================

/// Модель пользователя системы
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    /// Идентификатор пользователя
    pub id: Option<i64>,
    /// Имя пользователя для входа
    pub username: String,
    /// Пароль пользователя (в хэшированном виде)
    #[serde(skip_serializing)]
    pub password_hash: String,
    /// Электронная почта пользователя
    pub email: Option<String>,
    /// Дата создания пользователя
    pub created_at: Option<DateTime<Utc>>,
}

// ============================================================================
// РЕАЛИЗАЦИЯ МЕТОДОВ
// ============================================================================

impl User {
    /// Создаёт нового пользователя в базе данных
    pub async fn create(&self, pool: &PgPool) -> Result<i64, sqlx::Error> {
        let result = sqlx::query!(
            "INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING id",
            self.username,
            self.password_hash,
            self.email
        )
        .fetch_one(pool)
        .await?;

        Ok(result.id)
    }

    /// Находит пользователя по имени пользователя
    pub async fn find_by_username(
        username: &str,
        pool: &PgPool,
    ) -> Result<Option<User>, sqlx::Error> {
        let user = sqlx::query_as!(
            User,
            "SELECT id, username, password_hash, email, created_at FROM users WHERE username = $1",
            username
        )
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }

    /// Проверяет учетные данные пользователя
    pub async fn authenticate(
        username: &str,
        password: &str,
        pool: &PgPool,
    ) -> Result<Option<User>, sqlx::Error> {
        let user = Self::find_by_username(username, pool).await?;

        if let Some(user) = user {
            // Verify the password hash
            if verify(password, &user.password_hash).unwrap_or(false) {
                return Ok(Some(user));
            }
        }

        Ok(None)
    }

    /// Находит пользователя по ID
    pub async fn find_by_id(user_id: i64, pool: &PgPool) -> Result<Option<User>, sqlx::Error> {
        let user = sqlx::query_as!(
            User,
            "SELECT id, username, password_hash, email, created_at FROM users WHERE id = $1",
            user_id
        )
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }

    /// Обновляет данные пользователя
    pub async fn update(&self, pool: &PgPool) -> Result<(), sqlx::Error> {
        if let Some(id) = self.id {
            sqlx::query!(
                "UPDATE users SET username = $1, password_hash = $2, email = $3 WHERE id = $4",
                self.username,
                self.password_hash,
                self.email,
                id
            )
            .execute(pool)
            .await?;
        }

        Ok(())
    }

    /// Удаляет пользователя по ID
    pub async fn delete(user_id: i64, pool: &PgPool) -> Result<(), sqlx::Error> {
        sqlx::query!("DELETE FROM users WHERE id = $1", user_id)
            .execute(pool)
            .await?;

        Ok(())
    }

    /// Получает всех пользователей
    pub async fn find_all(pool: &PgPool) -> Result<Vec<User>, sqlx::Error> {
        let users = sqlx::query_as!(
            User,
            "SELECT id, username, password_hash, email, created_at FROM users ORDER BY created_at DESC"
        )
        .fetch_all(pool)
        .await?;

        Ok(users)
    }

    /// Проверяет существование пользователя с данным именем
    pub async fn exists_by_username(username: &str, pool: &PgPool) -> Result<bool, sqlx::Error> {
        let result = sqlx::query!(
            "SELECT COUNT(*) as count FROM users WHERE username = $1",
            username
        )
        .fetch_one(pool)
        .await?;

        Ok(result.count.unwrap_or(0) > 0)
    }

    /// Проверяет существование пользователя с данным email
    pub async fn exists_by_email(email: &str, pool: &PgPool) -> Result<bool, sqlx::Error> {
        let result = sqlx::query!(
            "SELECT COUNT(*) as count FROM users WHERE email = $1",
            email
        )
        .fetch_one(pool)
        .await?;

        Ok(result.count.unwrap_or(0) > 0)
    }

    // ========================================================================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // ========================================================================

    /// Создает нового пользователя с валидацией и хэшированием пароля
    pub fn new(username: String, password: String, email: Option<String>) -> Result<Self, String> {
        if username.is_empty() {
            return Err("Username cannot be empty".to_string());
        }

        if password.is_empty() {
            return Err("Password cannot be empty".to_string());
        }

        if username.len() < 3 {
            return Err("Username must be at least 3 characters long".to_string());
        }

        if password.len() < 6 {
            return Err("Password must be at least 6 characters long".to_string());
        }

        // Hash the password
        let password_hash =
            hash(password, DEFAULT_COST).map_err(|_| "Failed to hash password".to_string())?;

        Ok(User {
            id: None,
            username,
            password_hash,
            email,
            created_at: None,
        })
    }

    /// Проверяет права администратора (заглушка)
    pub fn is_admin(&self) -> bool {
        // В будущем можно добавить поле role в базу данных
        false
    }

    /// Получает публичную информацию о пользователе (без пароля)
    pub fn public_info(&self) -> PublicUser {
        PublicUser {
            id: self.id,
            username: self.username.clone(),
            email: self.email.clone(),
            created_at: self.created_at,
        }
    }
}

// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ СТРУКТУРЫ
// ============================================================================

/// Публичная информация о пользователе (без пароля)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PublicUser {
    pub id: Option<i64>,
    pub username: String,
    pub email: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}
