//! Repository pattern для работы с базой данных
//! 
//! Этот модуль предоставляет методы для записи данных в базу данных.
//! Все операции чтения должны идти через кеш.

use rusqlite::{params, Connection, Result};
use std::sync::{Arc, Mutex};
use log::{debug, error};

use crate::domain::chat::{Chat, Message, ChatType, MessageType};

/// Репозиторий для работы с чатами
pub struct ChatRepository {
    conn: Arc<Mutex<Connection>>,
}

impl ChatRepository {
    pub fn new(conn: Arc<Mutex<Connection>>) -> Self {
        Self { conn }
    }

    /// Создает новый чат в БД
    pub fn create_chat(&self, chat: &Chat) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        
        let chat_type_str = match chat.chat_type {
            ChatType::Direct => "direct",
            ChatType::Group => "group",
            ChatType::Channel => "channel",
        };
        
        conn.execute(
            "INSERT INTO chats (name, chat_type, creator_id) VALUES (?1, ?2, ?3)",
            params![chat.name, chat_type_str, chat.creator_id],
        )?;
        
        let chat_id = conn.last_insert_rowid();
        debug!("Чат создан в БД с ID: {}", chat_id);
        
        Ok(chat_id)
    }

    /// Добавляет участника в чат
    pub fn add_participant(&self, chat_id: i64, user_id: i64, role: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        
        conn.execute(
            "INSERT INTO chat_participants (chat_id, user_id, role) VALUES (?1, ?2, ?3)",
            params![chat_id, user_id, role],
        )?;
        
        debug!("Участник {} добавлен в чат {}", user_id, chat_id);
        
        Ok(())
    }
}

/// Репозиторий для работы с сообщениями
pub struct MessageRepository {
    conn: Arc<Mutex<Connection>>,
}

impl MessageRepository {
    pub fn new(conn: Arc<Mutex<Connection>>) -> Self {
        Self { conn }
    }

    /// Создает новое сообщение в БД
    pub fn create_message(&self, message: &Message) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        
        let message_type_str = match message.message_type {
            MessageType::Text => "text",
            MessageType::Image => "image",
            MessageType::File => "file",
            MessageType::System => "system",
        };
        
        conn.execute(
            "INSERT INTO messages (chat_id, sender_id, content, message_type) VALUES (?1, ?2, ?3, ?4)",
            params![message.chat_id, message.sender_id, message.content, message_type_str],
        )?;
        
        let message_id = conn.last_insert_rowid();
        
        // Обновляем время последнего обновления чата
        conn.execute(
            "UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?1",
            params![message.chat_id],
        )?;
        
        debug!("Сообщение создано в БД с ID: {}", message_id);
        
        Ok(message_id)
    }
}
