//! Ядро системы - работа с базой данных

use rusqlite::{Connection, Result};
use std::sync::{Arc, Mutex};
use std::path::Path;

/// Структура для работы с базой данных
pub struct Database {
    pub connection: Arc<Mutex<Connection>>,
}

impl Database {
    /// Создает новое подключение к базе данных
    pub fn new(db_path: &str) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        
        // Создаем таблицы если их нет
        Self::create_tables(&conn)?;
        
        Ok(Database {
            connection: Arc::new(Mutex::new(conn)),
        })
    }

    /// Получает подключение к базе данных
    pub fn get_connection(&self) -> Arc<Mutex<Connection>> {
        Arc::clone(&self.connection)
    }

    /// Создает все необходимые таблицы
    fn create_tables(conn: &Connection) -> Result<()> {
        // Таблица пользователей
        conn.execute(
            "CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                email TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;
        
        // Добавляю по дефолту себя
        conn.execute(
            "
            INSERT INTO users (username, password, email) 
            VALUES ('Kazilsky', 'password123', 'mk9151341600@gmail.com')
            ",
            []
        );

        println!("Добавлен пользователь Kazilsky с паролем password123");

        // Таблица проектов
        conn.execute(
            "CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                owner_id INTEGER NOT NULL,
                description TEXT,
                is_public BOOLEAN NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users (id),
                UNIQUE(name, owner_id)
            )",
            [],
        )?;

        // Таблица конфигураций проектов
        conn.execute(
            "CREATE TABLE IF NOT EXISTS project_configs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL UNIQUE,
                config_json TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
            )",
            [],
        )?;

        // Таблица репозиториев
        conn.execute(
            "CREATE TABLE IF NOT EXISTS repositories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                project_id INTEGER NOT NULL,
                owner_id INTEGER NOT NULL,
                description TEXT,
                is_public BOOLEAN NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id),
                FOREIGN KEY (owner_id) REFERENCES users (id),
                UNIQUE(name, project_id)
            )",
            [],
        )?;

        // Таблица уведомлений
        conn.execute(
            "CREATE TABLE IF NOT EXISTS notification (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        // Таблица чатов
        conn.execute(
            "CREATE TABLE IF NOT EXISTS chats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                chat_type TEXT NOT NULL CHECK(chat_type IN ('direct', 'group', 'channel')),
                creator_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (creator_id) REFERENCES users (id)
            )",
            [],
        )?;

        // Таблица участников чатов
        conn.execute(
            "CREATE TABLE IF NOT EXISTS chat_participants (
                chat_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('admin', 'moderator', 'member')),
                joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_read_at DATETIME,
                PRIMARY KEY (chat_id, user_id),
                FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )",
            [],
        )?;

        // Таблица сообщений
        conn.execute(
            "CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chat_id INTEGER NOT NULL,
                sender_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                message_type TEXT NOT NULL CHECK(message_type IN ('text', 'image', 'file', 'system')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_edited BOOLEAN NOT NULL DEFAULT 0,
                edited_at DATETIME,
                FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE,
                FOREIGN KEY (sender_id) REFERENCES users (id)
            )",
            [],
        )?;

        // Индексы для оптимизации запросов
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages (chat_id)",
            [],
        )?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at)",
            [],
        )?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants (user_id)",
            [],
        )?;

        Ok(())
    }

    /// Проверяет подключение к базе данных
    pub fn test_connection(&self) -> Result<()> {
        let conn = self.connection.lock().unwrap();
        conn.query_row("SELECT 1", [], |_| Ok(()))?;
        Ok(())
    }
}

impl Clone for Database {
    fn clone(&self) -> Self {
        Database {
            connection: Arc::clone(&self.connection),
        }
    }
}
