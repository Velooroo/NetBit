//! Доменная модель чата и сообщений с автоматической ORM

use crate::core::orm::{DatabaseModel, Repository, CrudOperations};
use crate::{database_model, repository};
use rusqlite::{params, Result, Row};
use std::sync::{Arc, Mutex};
use serde::{Serialize, Deserialize};
use rusqlite::Connection;
use chrono::{DateTime, Utc};
use log::{debug, error, info};

// ============================================================================
// СТРУКТУРЫ ДАННЫХ
// ============================================================================

/// Модель чата с автоматической синхронизацией БД
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Chat {
    /// Идентификатор чата
    pub id: Option<i64>,
    /// Название чата
    pub name: String,
    /// Описание чата
    pub description: Option<String>,
    /// Тип чата (личный, групповой)
    pub chat_type: ChatType,
    /// Идентификатор создателя чата
    pub creator_id: i64,
    /// Аватар чата (для групповых чатов)
    pub avatar: Option<String>,
    /// Флаг активности чата
    pub is_active: bool,
    /// Дата создания чата
    pub created_at: Option<DateTime<Utc>>,
    /// Дата последнего обновления
    pub updated_at: Option<DateTime<Utc>>,
}

/// Тип чата
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum ChatType {
    /// Личный чат между двумя пользователями
    Direct,
    /// Групповой чат
    Group,
    /// Канал (только админы могут писать)
    Channel,
}

impl ChatType {
    pub fn to_string(&self) -> String {
        match self {
            ChatType::Direct => "direct".to_string(),
            ChatType::Group => "group".to_string(),
            ChatType::Channel => "channel".to_string(),
        }
    }
    
    pub fn from_string(s: &str) -> ChatType {
        match s {
            "direct" => ChatType::Direct,
            "group" => ChatType::Group,
            "channel" => ChatType::Channel,
            _ => ChatType::Direct,
        }
    }
}

/// Модель сообщения с автоматической синхронизацией БД
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
    /// Тип сообщения (текст, изображение, файл)
    pub message_type: MessageType,
    /// Ответ на сообщение (ID родительского сообщения)
    pub reply_to: Option<i64>,
    /// Флаг прочитанности
    pub is_read: bool,
    /// Флаг редактирования
    pub is_edited: bool,
    /// Дата создания сообщения
    pub created_at: Option<DateTime<Utc>>,
    /// Дата последнего обновления
    pub updated_at: Option<DateTime<Utc>>,
}

/// Тип сообщения
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
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

impl MessageType {
    pub fn to_string(&self) -> String {
        match self {
            MessageType::Text => "text".to_string(),
            MessageType::Image => "image".to_string(),
            MessageType::File => "file".to_string(),
            MessageType::System => "system".to_string(),
        }
    }
    
    pub fn from_string(s: &str) -> MessageType {
        match s {
            "text" => MessageType::Text,
            "image" => MessageType::Image,
            "file" => MessageType::File,
            "system" => MessageType::System,
            _ => MessageType::Text,
        }
    }
}

/// Участник чата
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMember {
    /// Идентификатор записи
    pub id: Option<i64>,
    /// Идентификатор чата
    pub chat_id: i64,
    /// Идентификатор пользователя
    pub user_id: i64,
    /// Роль в чате
    pub role: ChatRole,
    /// Дата присоединения
    pub joined_at: Option<DateTime<Utc>>,
}

/// Роль пользователя в чате
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum ChatRole {
    /// Обычный участник
    Member,
    /// Модератор
    Moderator,
    /// Администратор
    Admin,
    /// Создатель
    Owner,
}

impl ChatRole {
    pub fn to_string(&self) -> String {
        match self {
            ChatRole::Member => "member".to_string(),
            ChatRole::Moderator => "moderator".to_string(),
            ChatRole::Admin => "admin".to_string(),
            ChatRole::Owner => "owner".to_string(),
        }
    }
    
    pub fn from_string(s: &str) -> ChatRole {
        match s {
            "member" => ChatRole::Member,
            "moderator" => ChatRole::Moderator,
            "admin" => ChatRole::Admin,
            "owner" => ChatRole::Owner,
            _ => ChatRole::Member,
        }
    }
}

/// Расширенная информация о чате с последним сообщением
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatWithLastMessage {
    pub chat: Chat,
    pub last_message: Option<Message>,
    pub unread_count: i64,
    pub member_count: i64,
}

// ============================================================================
// АВТОМАТИЧЕСКАЯ ORM КОНФИГУРАЦИЯ
// ============================================================================

// Автоматически генерируем DatabaseModel для Chat
database_model!(
    Chat,
    table = "chats",
    schema = "CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        chat_type TEXT NOT NULL DEFAULT 'direct',
        creator_id INTEGER NOT NULL,
        avatar TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id)
    )",
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_chats_creator ON chats(creator_id)",
        "CREATE INDEX IF NOT EXISTS idx_chats_type ON chats(chat_type)",
        "CREATE INDEX IF NOT EXISTS idx_chats_active ON chats(is_active)"
    ]
);

// Автоматически генерируем DatabaseModel для Message
database_model!(
    Message,
    table = "messages",
    schema = "CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        message_type TEXT DEFAULT 'text',
        reply_to INTEGER,
        is_read BOOLEAN DEFAULT 0,
        is_edited BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES chats(id),
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (reply_to) REFERENCES messages(id)
    )",
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id)",
        "CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)",
        "CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at)",
        "CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read)"
    ]
);

// Автоматически генерируем DatabaseModel для ChatMember
database_model!(
    ChatMember,
    table = "chat_members",
    schema = "CREATE TABLE IF NOT EXISTS chat_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT DEFAULT 'member',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES chats(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(chat_id, user_id)
    )",
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_chat_members_chat ON chat_members(chat_id)",
        "CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id)"
    ]
);

// Создаём типы репозиториев
repository!(Chat);
repository!(Message);
repository!(ChatMember);

// ============================================================================
// РАСШИРЕННЫЕ МЕТОДЫ ДЛЯ CHAT REPOSITORY
// ============================================================================

impl ChatRepository {
    /// Создаёт новый чат
    pub fn create_chat(&self, mut chat: Chat) -> Result<Chat> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        conn.execute(
            "INSERT INTO chats (name, description, chat_type, creator_id, avatar, is_active) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                chat.name,
                chat.description,
                chat.chat_type.to_string(),
                chat.creator_id,
                chat.avatar,
                chat.is_active
            ],
        )?;
        
        let id = conn.last_insert_rowid();
        chat.id = Some(id);
        
        info!("Created chat: {} with ID: {}", chat.name, id);
        
        Ok(chat)
    }
    
    /// Получает чаты пользователя
    pub fn get_user_chats(&self, user_id: i64) -> Result<Vec<ChatWithLastMessage>> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        let mut stmt = conn.prepare("
            SELECT DISTINCT c.id, c.name, c.description, c.chat_type, c.creator_id, 
                   c.avatar, c.is_active, c.created_at, c.updated_at
            FROM chats c
            LEFT JOIN chat_members cm ON c.id = cm.chat_id
            WHERE c.creator_id = ?1 OR cm.user_id = ?1
            ORDER BY c.updated_at DESC
        ")?;
        
        let chat_iter = stmt.query_map(params![user_id], |row| {
            Ok(Chat {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                description: row.get(2)?,
                chat_type: ChatType::from_string(&row.get::<_, String>(3)?),
                creator_id: row.get(4)?,
                avatar: row.get(5)?,
                is_active: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })?;
        
        let mut chats_with_messages = Vec::new();
        
        for chat_result in chat_iter {
            let chat = chat_result?;
            let chat_id = chat.id.unwrap();
            
            // Получаем последнее сообщение
            let last_message = self.get_last_message(chat_id)?;
            
            // Получаем количество непрочитанных сообщений
            let unread_count = self.get_unread_count(chat_id, user_id)?;
            
            // Получаем количество участников
            let member_count = self.get_member_count(chat_id)?;
            
            chats_with_messages.push(ChatWithLastMessage {
                chat,
                last_message,
                unread_count,
                member_count,
            });
        }
        
        Ok(chats_with_messages)
    }
    
    /// Получает последнее сообщение в чате
    fn get_last_message(&self, chat_id: i64) -> Result<Option<Message>> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        let mut stmt = conn.prepare("
            SELECT id, chat_id, sender_id, content, message_type, reply_to, 
                   is_read, is_edited, created_at, updated_at
            FROM messages 
            WHERE chat_id = ?1 
            ORDER BY created_at DESC 
            LIMIT 1
        ")?;
        
        let message_result = stmt.query_row(params![chat_id], |row| {
            Ok(Message {
                id: Some(row.get(0)?),
                chat_id: row.get(1)?,
                sender_id: row.get(2)?,
                content: row.get(3)?,
                message_type: MessageType::from_string(&row.get::<_, String>(4)?),
                reply_to: row.get(5)?,
                is_read: row.get(6)?,
                is_edited: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        });
        
        match message_result {
            Ok(message) => Ok(Some(message)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }
    
    /// Получает количество непрочитанных сообщений
    fn get_unread_count(&self, chat_id: i64, user_id: i64) -> Result<i64> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        let count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM messages 
             WHERE chat_id = ?1 AND sender_id != ?2 AND is_read = 0",
            params![chat_id, user_id],
            |row| row.get(0),
        ).unwrap_or(0);
        
        Ok(count)
    }
    
    /// Получает количество участников чата
    fn get_member_count(&self, chat_id: i64) -> Result<i64> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        let count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM chat_members WHERE chat_id = ?1",
            params![chat_id],
            |row| row.get(0),
        ).unwrap_or(0);
        
        Ok(count)
    }
}

// ============================================================================
// РАСШИРЕННЫЕ МЕТОДЫ ДЛЯ MESSAGE REPOSITORY
// ============================================================================

impl MessageRepository {
    /// Создаёт новое сообщение
    pub fn create_message(&self, mut message: Message) -> Result<Message> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        conn.execute(
            "INSERT INTO messages (chat_id, sender_id, content, message_type, reply_to, is_read, is_edited) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                message.chat_id,
                message.sender_id,
                message.content,
                message.message_type.to_string(),
                message.reply_to,
                message.is_read,
                message.is_edited
            ],
        )?;
        
        let id = conn.last_insert_rowid();
        message.id = Some(id);
        
        // Обновляем время последнего обновления чата
        conn.execute(
            "UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?1",
            params![message.chat_id],
        )?;
        
        info!("Created message with ID: {} in chat: {}", id, message.chat_id);
        
        Ok(message)
    }
    
    /// Получает сообщения чата с пагинацией
    pub fn get_chat_messages(&self, chat_id: i64, limit: i64, offset: i64) -> Result<Vec<Message>> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        let mut stmt = conn.prepare("
            SELECT id, chat_id, sender_id, content, message_type, reply_to, 
                   is_read, is_edited, created_at, updated_at
            FROM messages 
            WHERE chat_id = ?1 
            ORDER BY created_at DESC 
            LIMIT ?2 OFFSET ?3
        ")?;
        
        let message_iter = stmt.query_map(params![chat_id, limit, offset], |row| {
            Ok(Message {
                id: Some(row.get(0)?),
                chat_id: row.get(1)?,
                sender_id: row.get(2)?,
                content: row.get(3)?,
                message_type: MessageType::from_string(&row.get::<_, String>(4)?),
                reply_to: row.get(5)?,
                is_read: row.get(6)?,
                is_edited: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        })?;
        
        let mut messages = Vec::new();
        for message in message_iter {
            messages.push(message?);
        }
        
        // Возвращаем в правильном порядке (старые сообщения первыми)
        messages.reverse();
        Ok(messages)
    }
    
    /// Отмечает сообщения как прочитанные
    pub fn mark_messages_as_read(&self, chat_id: i64, user_id: i64) -> Result<()> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        conn.execute(
            "UPDATE messages SET is_read = 1 
             WHERE chat_id = ?1 AND sender_id != ?2 AND is_read = 0",
            params![chat_id, user_id],
        )?;
        
        info!("Marked messages as read for chat: {} user: {}", chat_id, user_id);
        
        Ok(())
    }
}

// ============================================================================
// РАСШИРЕННЫЕ МЕТОДЫ ДЛЯ CHAT_MEMBER REPOSITORY
// ============================================================================

impl ChatMemberRepository {
    /// Добавляет участника в чат
    pub fn add_member(&self, chat_id: i64, user_id: i64, role: ChatRole) -> Result<ChatMember> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        conn.execute(
            "INSERT INTO chat_members (chat_id, user_id, role) VALUES (?1, ?2, ?3)",
            params![chat_id, user_id, role.to_string()],
        )?;
        
        let id = conn.last_insert_rowid();
        
        let member = ChatMember {
            id: Some(id),
            chat_id,
            user_id,
            role,
            joined_at: Some(Utc::now()),
        };
        
        info!("Added member {} to chat {}", user_id, chat_id);
        
        Ok(member)
    }
    
    /// Получает участников чата
    pub fn get_chat_members(&self, chat_id: i64) -> Result<Vec<ChatMember>> {
        let conn = self.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
        
        let mut stmt = conn.prepare("
            SELECT id, chat_id, user_id, role, joined_at
            FROM chat_members 
            WHERE chat_id = ?1 
            ORDER BY joined_at
        ")?;
        
        let member_iter = stmt.query_map(params![chat_id], |row| {
            Ok(ChatMember {
                id: Some(row.get(0)?),
                chat_id: row.get(1)?,
                user_id: row.get(2)?,
                role: ChatRole::from_string(&row.get::<_, String>(3)?),
                joined_at: row.get(4)?,
            })
        })?;
        
        let mut members = Vec::new();
        for member in member_iter {
            members.push(member?);
        }
        
        Ok(members)
    }
}
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
