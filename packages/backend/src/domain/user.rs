//! Доменная модель пользователя

use rusqlite::{params, Result};
use std::sync::{Arc, Mutex};
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc, NaiveDateTime};
use rusqlite::Connection;

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
    pub password: String,
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
    pub fn create(&self, conn: Arc<Mutex<Connection>>) -> Result<i64> {
        let conn = conn.lock().unwrap();
        
        conn.execute(
            "INSERT INTO users (username, password, email) VALUES (?1, ?2, ?3)",
            params![self.username, self.password, self.email],
        )?;
        
        Ok(conn.last_insert_rowid())
    }

    /// Находит пользователя по имени пользователя
    pub fn find_by_username(username: &str, conn: Arc<Mutex<Connection>>) -> Result<Option<User>> {
        let conn = conn.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;        

        let mut stmt = conn.prepare("SELECT id, username, password, email, created_at FROM users WHERE username = ?1")?;
        let mut rows = stmt.query(params![username])?;
        
        if let Some(row) = rows.next()? {
            let created_at = Self::parse_datetime(row.get(4).ok());
            
            Ok(Some(User {
                id: Some(row.get(0)?),
                username: row.get(1)?,
                password: row.get(2)?,
                email: row.get(3)?,
                created_at,
            }))
        } else {
            Ok(None)
        }
    }

    /// Проверяет учетные данные пользователя
    pub fn authenticate(username: &str, password: &str, conn: Arc<Mutex<Connection>>) -> Result<Option<User>> {
        let user = Self::find_by_username(username, conn)?;
        
        if let Some(user) = user {
            if user.password == password {
                return Ok(Some(user));
            }
        }
        
        Ok(None)
    }

    /// Находит пользователя по ID
    pub fn find_by_id(user_id: i64, conn: Arc<Mutex<Connection>>) -> Result<Option<User>> {
        let conn = conn.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;        

        let mut stmt = conn.prepare("SELECT id, username, password, email, created_at FROM users WHERE id = ?1")?;
        let mut rows = stmt.query(params![user_id])?;
        
        if let Some(row) = rows.next()? {
            let created_at = Self::parse_datetime(row.get(4).ok());
            
            Ok(Some(User {
                id: Some(row.get(0)?),
                username: row.get(1)?,
                password: row.get(2)?,
                email: row.get(3)?,
                created_at,
            }))
        } else {
            Ok(None)
        }
    }

    /// Обновляет данные пользователя
    pub fn update(&self, conn: Arc<Mutex<Connection>>) -> Result<()> {
        let conn = conn.lock().unwrap();

        if let Some(id) = self.id {
            conn.execute(
                "UPDATE users SET username = ?1, password = ?2, email = ?3 WHERE id = ?4",
                params![self.username, self.password, self.email, id]
            )?;
        }

        Ok(())
    }

    /// Удаляет пользователя по ID
    pub fn delete(user_id: i64, conn: Arc<Mutex<Connection>>) -> Result<()> {
        let conn = conn.lock().unwrap();

        conn.execute(
            "DELETE FROM users WHERE id = ?1",
            params![user_id]
        )?;

        Ok(())
    }

    /// Получает всех пользователей
    pub fn find_all(conn: Arc<Mutex<Connection>>) -> Result<Vec<User>> {
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, username, password, email, created_at FROM users ORDER BY created_at DESC"
        )?;

        let users = stmt.query_map([], |row| {
            let created_at = Self::parse_datetime(row.get(4).ok());
            
            Ok(User {
                id: Some(row.get(0)?),
                username: row.get(1)?,
                password: row.get(2)?,
                email: row.get(3)?,
                created_at,
            })
        })?;

        let mut result = Vec::new();
        for user in users {
            result.push(user?);
        }

        Ok(result)
    }

    /// Проверяет существование пользователя с данным именем
    pub fn exists_by_username(username: &str, conn: Arc<Mutex<Connection>>) -> Result<bool> {
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare("SELECT COUNT(*) FROM users WHERE username = ?1")?;
        let count: i64 = stmt.query_row(params![username], |row| row.get(0))?;

        Ok(count > 0)
    }

    /// Проверяет существование пользователя с данным email
    pub fn exists_by_email(email: &str, conn: Arc<Mutex<Connection>>) -> Result<bool> {
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare("SELECT COUNT(*) FROM users WHERE email = ?1")?;
        let count: i64 = stmt.query_row(params![email], |row| row.get(0))?;

        Ok(count > 0)
    }

    // ========================================================================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // ========================================================================

    /// Парсит дату из строки в различных форматах
    fn parse_datetime(datetime_str: Option<String>) -> Option<DateTime<Utc>> {
        if let Some(datetime_str) = datetime_str {
            // Пробуем разные форматы даты
            if let Ok(dt) = DateTime::parse_from_rfc3339(&datetime_str) {
                Some(dt.with_timezone(&Utc))
            } else {
                // Если формат не RFC3339, возможно это формат SQLite (YYYY-MM-DD HH:MM:SS)
                let naive = NaiveDateTime::parse_from_str(&datetime_str, "%Y-%m-%d %H:%M:%S")
                    .or_else(|_| NaiveDateTime::parse_from_str(&datetime_str, "%Y-%m-%dT%H:%M:%S"));
                
                if let Ok(ndt) = naive {
                    Some(DateTime::<Utc>::from_naive_utc_and_offset(ndt, Utc))
                } else {
                    None
                }
            }
        } else {
            None
        }
    }

    /// Создает нового пользователя с валидацией
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

        Ok(User {
            id: None,
            username,
            password, // В реальном проекте здесь должно быть хэширование
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
