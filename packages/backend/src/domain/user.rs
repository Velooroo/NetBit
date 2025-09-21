//! Доменная модель пользователя с автоматической ORM

use crate::core::orm::{DatabaseModel, Repository, CrudOperations};
use crate::{database_model, repository};
use rusqlite::{params, Result, Row};
use std::sync::{Arc, Mutex};
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use rusqlite::Connection;
use log::{info, error};

// ============================================================================
// СТРУКТУРЫ ДАННЫХ
// ============================================================================

/// Модель пользователя системы с автоматической синхронизацией БД
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
    /// Полное имя пользователя
    pub full_name: Option<String>,
    /// Аватар пользователя (base64 или URL)
    pub avatar: Option<String>,
    /// Биография пользователя
    pub bio: Option<String>,
    /// Статус активности (онлайн/офлайн)
    pub is_active: bool,
    /// Дата создания пользователя
    pub created_at: Option<DateTime<Utc>>,
    /// Дата последнего обновления
    pub updated_at: Option<DateTime<Utc>>,
}

/// Публичная информация о пользователе (без приватных данных)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserProfile {
    pub id: i64,
    pub username: String,
    pub full_name: Option<String>,
    pub avatar: Option<String>,
    pub bio: Option<String>,
    pub is_active: bool,
    pub created_at: Option<DateTime<Utc>>,
}

/// Статистика пользователя
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserStats {
    pub projects_count: i64,
    pub repositories_count: i64,
    pub messages_count: i64,
    pub last_activity: Option<DateTime<Utc>>,
}

// ============================================================================
// АВТОМАТИЧЕСКАЯ ORM КОНФИГУРАЦИЯ
// ============================================================================

// Автоматически генерируем DatabaseModel для User
database_model!(
    User,
    table = "users",
    schema = "CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        full_name TEXT,
        avatar TEXT,
        bio TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )",
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)",
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
        "CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)"
    ]
);

// Создаём тип репозитория для User
repository!(User);

// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ ДЛЯ USER
// ============================================================================

impl User {
    /// Создаёт нового пользователя с хэшированным паролем
    pub fn new(username: String, password: String, email: Option<String>) -> Self {
        Self {
            id: None,
            username,
            password: Self::hash_password(&password),
            email,
            full_name: None,
            avatar: None,
            bio: None,
            is_active: true,
            created_at: Some(Utc::now()),
            updated_at: Some(Utc::now()),
        }
    }
    
    /// Хэширует пароль (упрощённая версия)
    pub fn hash_password(password: &str) -> String {
        // В продакшене здесь должно быть bcrypt или argon2
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        
        let mut hasher = DefaultHasher::new();
        password.hash(&mut hasher);
        format!("hash_{}", hasher.finish())
    }
    
    /// Проверяет пароль
    pub fn verify_password(&self, password: &str) -> bool {
        self.password == Self::hash_password(password)
    }
    
    /// Получает публичный профиль пользователя
    pub fn to_profile(&self) -> UserProfile {
        UserProfile {
            id: self.id.unwrap_or(0),
            username: self.username.clone(),
            full_name: self.full_name.clone(),
            avatar: self.avatar.clone(),
            bio: self.bio.clone(),
            is_active: self.is_active,
            created_at: self.created_at,
        }
    }
}

// ============================================================================
// РАСШИРЕННЫЕ МЕТОДЫ РЕПОЗИТОРИЯ
// ============================================================================

impl UserRepository {
    /// Находит пользователя по имени пользователя
    pub fn find_by_username(&self, username: &str) -> Result<Option<User>> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        let mut stmt = conn.prepare(
            "SELECT id, username, password, email, full_name, avatar, bio, is_active, created_at, updated_at 
             FROM users WHERE username = ?1"
        )?;
        
        let user_result = stmt.query_row(params![username], |row| {
            Ok(User {
                id: Some(row.get(0)?),
                username: row.get(1)?,
                password: row.get(2)?,
                email: row.get(3)?,
                full_name: row.get(4)?,
                avatar: row.get(5)?,
                bio: row.get(6)?,
                is_active: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        });
        
        match user_result {
            Ok(user) => Ok(Some(user)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }
    
    /// Находит пользователя по email
    pub fn find_by_email(&self, email: &str) -> Result<Option<User>> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        let mut stmt = conn.prepare(
            "SELECT id, username, password, email, full_name, avatar, bio, is_active, created_at, updated_at 
             FROM users WHERE email = ?1"
        )?;
        
        let user_result = stmt.query_row(params![email], |row| {
            Ok(User {
                id: Some(row.get(0)?),
                username: row.get(1)?,
                password: row.get(2)?,
                email: row.get(3)?,
                full_name: row.get(4)?,
                avatar: row.get(5)?,
                bio: row.get(6)?,
                is_active: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        });
        
        match user_result {
            Ok(user) => Ok(Some(user)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }
    
    /// Создаёт нового пользователя
    pub fn create_user(&self, mut user: User) -> Result<User> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        conn.execute(
            "INSERT INTO users (username, password, email, full_name, avatar, bio, is_active) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                user.username,
                user.password,
                user.email,
                user.full_name,
                user.avatar,
                user.bio,
                user.is_active
            ],
        )?;
        
        let id = conn.last_insert_rowid();
        user.id = Some(id);
        
        info!("Created user: {} with ID: {}", user.username, id);
        
        Ok(user)
    }
    
    /// Обновляет информацию о пользователе
    pub fn update_user(&self, user: &User) -> Result<()> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        if let Some(id) = user.id {
            conn.execute(
                "UPDATE users SET 
                 username = ?1, email = ?2, full_name = ?3, avatar = ?4, 
                 bio = ?5, is_active = ?6, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?7",
                params![
                    user.username,
                    user.email,
                    user.full_name,
                    user.avatar,
                    user.bio,
                    user.is_active,
                    id
                ],
            )?;
            
            info!("Updated user with ID: {}", id);
        }
        
        Ok(())
    }
    
    /// Получает статистику пользователя
    pub fn get_user_stats(&self, user_id: i64) -> Result<UserStats> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        // Получаем количество проектов
        let projects_count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM projects WHERE creator_id = ?1",
            params![user_id],
            |row| row.get(0),
        ).unwrap_or(0);
        
        // Получаем количество репозиториев
        let repositories_count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM repositories WHERE owner_id = ?1",
            params![user_id],
            |row| row.get(0),
        ).unwrap_or(0);
        
        // Получаем количество сообщений
        let messages_count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM messages WHERE sender_id = ?1",
            params![user_id],
            |row| row.get(0),
        ).unwrap_or(0);
        
        // Последняя активность (примерно)
        let last_activity: Option<DateTime<Utc>> = conn.query_row(
            "SELECT MAX(created_at) FROM messages WHERE sender_id = ?1",
            params![user_id],
            |row| row.get(0),
        ).ok();
        
        Ok(UserStats {
            projects_count,
            repositories_count,
            messages_count,
            last_activity,
        })
    }
    
    /// Получает активных пользователей
    pub fn get_active_users(&self) -> Result<Vec<UserProfile>> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        let mut stmt = conn.prepare(
            "SELECT id, username, full_name, avatar, bio, is_active, created_at 
             FROM users WHERE is_active = 1 ORDER BY username"
        )?;
        
        let user_iter = stmt.query_map([], |row| {
            Ok(UserProfile {
                id: row.get(0)?,
                username: row.get(1)?,
                full_name: row.get(2)?,
                avatar: row.get(3)?,
                bio: row.get(4)?,
                is_active: row.get(5)?,
                created_at: row.get(6)?,
            })
        })?;
        
        let mut users = Vec::new();
        for user in user_iter {
            users.push(user?);
        }
        
        Ok(users)
    }
}
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
