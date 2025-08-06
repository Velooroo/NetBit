//! Доменная модель чата и сообщений

use rusqlite::{params, Result};
use std::sync::{Arc, Mutex};
use serde::{Serialize, Deserialize};
use rusqlite::Connection;
use log::{debug, error};

// ============================================================================
// СТРУКТУРЫ ДАННЫХ
// ============================================================================

/// Модель чата
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Chat {
    /// Идентификатор чата
    pub id: Option<i64>,
    /// Название чата
    pub name: String,
    /// Тип чата (личный, групповой)
    pub chat_type: ChatType,
    /// Идентификатор создателя чата
    pub creator_id: i64,
    /// Дата создания чата
    pub created_at: Option<String>,
    /// Дата последнего обновления
    pub updated_at: Option<String>,
}

/// Тип чата
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ChatType {
    /// Личный чат между двумя пользователями
    Direct,
    /// Групповой чат
    Group,
    /// Канал (только админы могут писать)
    Channel,
}

/// Модель сообщения
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    /// Идентификатор сообщения
    pub id: Option<i64>,
    /// Идентификатор чата
    pub chat_id: i64,
    /// Идентификатор отправителя
    pub sender_id: i64,
    /// Содержимое сообщения
    pub content: String,
    /// Тип сообщения
    pub message_type: MessageType,
    /// Дата отправки
    pub created_at: Option<String>,
    /// Флаг редактирования
    pub is_edited: bool,
    /// Дата редактирования
    pub edited_at: Option<String>,
}

/// Тип сообщения
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum MessageType {
    /// Текстовое сообщение
    Text,
    /// Изображение
    Image,
    /// Файл
    File,
    /// Системное сообщение
    System,
}

/// Участник чата
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatParticipant {
    /// Идентификатор чата
    pub chat_id: i64,
    /// Идентификатор пользователя
    pub user_id: i64,
    /// Роль в чате
    pub role: ChatRole,
    /// Дата присоединения
    pub joined_at: Option<String>,
    /// Дата последнего прочтения
    pub last_read_at: Option<String>,
}

/// Роль участника в чате
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ChatRole {
    /// Администратор
    Admin,
    /// Модератор
    Moderator,
    /// Обычный участник
    Member,
}

// ============================================================================
// РЕАЛИЗАЦИЯ МЕТОДОВ ДЛЯ ЧАТА
// ============================================================================

impl Chat {
    /// Создаёт новый чат в базе данных
    pub fn create(&self, conn: Arc<Mutex<Connection>>) -> Result<i64> {
        let conn_guard = conn.lock().unwrap();
        
        let chat_type_str = match self.chat_type {
            ChatType::Direct => "direct",
            ChatType::Group => "group",
            ChatType::Channel => "channel",
        };
        
        conn_guard.execute(
            "INSERT INTO chats (name, chat_type, creator_id) VALUES (?1, ?2, ?3)",
            params![self.name, chat_type_str, self.creator_id],
        )?;
        
        let chat_id = conn_guard.last_insert_rowid();
        
        // Добавляем создателя как администратора
        conn_guard.execute(
            "INSERT INTO chat_participants (chat_id, user_id, role) VALUES (?1, ?2, 'admin')",
            params![chat_id, self.creator_id],
        )?;
        
        debug!("Чат успешно создан: {} (ID: {})", self.name, chat_id);
        
        Ok(chat_id)
    }

    /// Находит чат по ID
    pub fn find_by_id(chat_id: i64, conn: Arc<Mutex<Connection>>) -> Result<Option<Chat>> {
        let conn = conn.lock().unwrap();
        
        let mut stmt = conn.prepare(
            "SELECT id, name, chat_type, creator_id, created_at, updated_at FROM chats WHERE id = ?1"
        )?;
        
        let mut rows = stmt.query(params![chat_id])?;
        
        if let Some(row) = rows.next()? {
            let chat_type_str: String = row.get(2)?;
            let chat_type = match chat_type_str.as_str() {
                "direct" => ChatType::Direct,
                "group" => ChatType::Group,
                "channel" => ChatType::Channel,
                _ => ChatType::Direct,
            };
            
            Ok(Some(Chat {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                chat_type,
                creator_id: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            }))
        } else {
            Ok(None)
        }
    }

    /// Получает чаты пользователя
    pub fn find_by_user(user_id: i64, conn: Arc<Mutex<Connection>>) -> Result<Vec<Chat>> {
        let conn = conn.lock().unwrap();
        
        let mut stmt = conn.prepare(
            "SELECT c.id, c.name, c.chat_type, c.creator_id, c.created_at, c.updated_at 
             FROM chats c 
             JOIN chat_participants cp ON c.id = cp.chat_id 
             WHERE cp.user_id = ?1 
             ORDER BY c.updated_at DESC"
        )?;
        
        let chats = stmt.query_map(params![user_id], |row| {
            let chat_type_str: String = row.get(2)?;
            let chat_type = match chat_type_str.as_str() {
                "direct" => ChatType::Direct,
                "group" => ChatType::Group,
                "channel" => ChatType::Channel,
                _ => ChatType::Direct,
            };
            
            Ok(Chat {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                chat_type,
                creator_id: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })?;
        
        let mut result = Vec::new();
        for chat in chats {
            result.push(chat?);
        }
        
        Ok(result)
    }

    /// Добавляет участника в чат
    pub fn add_participant(&self, user_id: i64, role: ChatRole, conn: Arc<Mutex<Connection>>) -> Result<()> {
        if let Some(chat_id) = self.id {
            let conn = conn.lock().unwrap();
            
            let role_str = match role {
                ChatRole::Admin => "admin",
                ChatRole::Moderator => "moderator",
                ChatRole::Member => "member",
            };
            
            conn.execute(
                "INSERT INTO chat_participants (chat_id, user_id, role) VALUES (?1, ?2, ?3)",
                params![chat_id, user_id, role_str],
            )?;
            
            debug!("Пользователь {} добавлен в чат {}", user_id, chat_id);
        }
        
        Ok(())
    }
}

// ============================================================================
// РЕАЛИЗАЦИЯ МЕТОДОВ ДЛЯ СООБЩЕНИЯ
// ============================================================================

impl Message {
    /// Создаёт новое сообщение в базе данных
    pub fn create(&self, conn: Arc<Mutex<Connection>>) -> Result<i64> {
        let conn_guard = conn.lock().unwrap();
        
        let message_type_str = match self.message_type {
            MessageType::Text => "text",
            MessageType::Image => "image",
            MessageType::File => "file",
            MessageType::System => "system",
        };
        
        conn_guard.execute(
            "INSERT INTO messages (chat_id, sender_id, content, message_type) VALUES (?1, ?2, ?3, ?4)",
            params![self.chat_id, self.sender_id, self.content, message_type_str],
        )?;
        
        let message_id = conn_guard.last_insert_rowid();
        
        // Обновляем время последнего обновления чата
        conn_guard.execute(
            "UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?1",
            params![self.chat_id],
        )?;
        
        debug!("Сообщение успешно создано: ID {}", message_id);
        
        Ok(message_id)
    }

    /// Получает сообщения чата с пагинацией
    pub fn find_by_chat(
        chat_id: i64, 
        page: u32, 
        per_page: u32, 
        conn: Arc<Mutex<Connection>>
    ) -> Result<Vec<Message>> {
        let conn = conn.lock().unwrap();
        let offset = (page - 1) * per_page;
        
        let mut stmt = conn.prepare(
            "SELECT id, chat_id, sender_id, content, message_type, created_at, is_edited, edited_at 
             FROM messages 
             WHERE chat_id = ?1 
             ORDER BY created_at DESC 
             LIMIT ?2 OFFSET ?3"
        )?;
        
        let messages = stmt.query_map(params![chat_id, per_page, offset], |row| {
            let message_type_str: String = row.get(4)?;
            let message_type = match message_type_str.as_str() {
                "text" => MessageType::Text,
                "image" => MessageType::Image,
                "file" => MessageType::File,
                "system" => MessageType::System,
                _ => MessageType::Text,
            };
            
            Ok(Message {
                id: Some(row.get(0)?),
                chat_id: row.get(1)?,
                sender_id: row.get(2)?,
                content: row.get(3)?,
                message_type,
                created_at: row.get(5)?,
                is_edited: row.get(6)?,
                edited_at: row.get(7)?,
            })
        })?;
        
        let mut result = Vec::new();
        for message in messages {
            result.push(message?);
        }
        
        // Возвращаем в правильном порядке (старые сначала)
        result.reverse();
        Ok(result)
    }

    /// Создаёт новое сообщение с валидацией
    pub fn new(
        chat_id: i64, 
        sender_id: i64, 
        content: String, 
        message_type: MessageType
    ) -> Result<Self, String> {
        if content.is_empty() {
            return Err("Содержимое сообщения не может быть пустым".to_string());
        }

        if content.len() > 4000 {
            return Err("Сообщение не может быть длиннее 4000 символов".to_string());
        }

        Ok(Message {
            id: None,
            chat_id,
            sender_id,
            content,
            message_type,
            created_at: None,
            is_edited: false,
            edited_at: None,
        })
    }
}
