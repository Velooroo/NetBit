//! Доменная модель чата и сообщений - STUB для миграции

use sqlx::PgPool;
use serde::{Serialize, Deserialize};

// Simplified stubs to make code compile during migration
// TODO: Properly implement with sqlx

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Chat {
    pub id: Option<i64>,
    pub name: String,
    pub chat_type: ChatType,
    pub creator_id: i64,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum ChatType {
    Direct,
    Group,
    Channel,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub id: Option<i64>,
    pub chat_id: i64,
    pub sender_id: i64,
    pub content: String,
    pub message_type: MessageType,
    pub created_at: Option<String>,
    pub is_edited: bool,
    pub edited_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum MessageType {
    Text,
    Image,
    File,
    System,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatParticipant {
    pub chat_id: i64,
    pub user_id: i64,
    pub role: ChatRole,
    pub joined_at: Option<String>,
    pub last_read_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum ChatRole {
    Admin,
    Moderator,
    Member,
}

impl Chat {
    pub async fn create(&self, pool: &PgPool) -> Result<i64, sqlx::Error> {
        let chat_type_str = match self.chat_type {
            ChatType::Direct => "direct",
            ChatType::Group => "group",
            ChatType::Channel => "channel",
        };

        let result = sqlx::query!(
            "INSERT INTO chats (name, chat_type, creator_id) 
             VALUES ($1, $2, $3) RETURNING id",
            self.name,
            chat_type_str,
            self.creator_id
        )
        .fetch_one(pool)
        .await?;
        
        Ok(result.id)
    }

    pub async fn find_by_id(chat_id: i64, pool: &PgPool) -> Result<Option<Chat>, sqlx::Error> {
        let chat = sqlx::query!(
            "SELECT id, name, chat_type, creator_id, created_at::text, updated_at::text 
             FROM chats WHERE id = $1",
            chat_id
        )
        .fetch_optional(pool)
        .await?
        .map(|row| Chat {
            id: Some(row.id),
            name: row.name,
            chat_type: match row.chat_type.as_str() {
                "direct" => ChatType::Direct,
                "group" => ChatType::Group,
                "channel" => ChatType::Channel,
                _ => ChatType::Group,
            },
            creator_id: row.creator_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
        });
        
        Ok(chat)
    }

    pub async fn find_by_user(user_id: i64, pool: &PgPool) -> Result<Vec<Chat>, sqlx::Error> {
        let chats = sqlx::query!(
            "SELECT c.id, c.name, c.chat_type, c.creator_id, c.created_at::text, c.updated_at::text 
             FROM chats c
             INNER JOIN chat_participants cp ON c.id = cp.chat_id
             WHERE cp.user_id = $1",
            user_id
        )
        .fetch_all(pool)
        .await?
        .into_iter()
        .map(|row| Chat {
            id: Some(row.id),
            name: row.name,
            chat_type: match row.chat_type.as_str() {
                "direct" => ChatType::Direct,
                "group" => ChatType::Group,
                "channel" => ChatType::Channel,
                _ => ChatType::Group,
            },
            creator_id: row.creator_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
        .collect();
        
        Ok(chats)
    }

    pub async fn add_participant(&self, user_id: i64, role: ChatRole, pool: &PgPool) -> Result<(), sqlx::Error> {
        if let Some(chat_id) = self.id {
            let role_str = match role {
                ChatRole::Admin => "admin",
                ChatRole::Moderator => "moderator",
                ChatRole::Member => "member",
            };
            
            sqlx::query!(
                "INSERT INTO chat_participants (chat_id, user_id, role) 
                 VALUES ($1, $2, $3) 
                 ON CONFLICT (chat_id, user_id) DO NOTHING",
                chat_id,
                user_id,
                role_str
            )
            .execute(pool)
            .await?;
        }
        
        Ok(())
    }
}

impl Message {
    pub async fn create(&self, pool: &PgPool) -> Result<i64, sqlx::Error> {
        let message_type_str = match self.message_type {
            MessageType::Text => "text",
            MessageType::Image => "image",
            MessageType::File => "file",
            MessageType::System => "system",
        };

        let result = sqlx::query!(
            "INSERT INTO messages (chat_id, sender_id, content, message_type) 
             VALUES ($1, $2, $3, $4) RETURNING id",
            self.chat_id,
            self.sender_id,
            self.content,
            message_type_str
        )
        .fetch_one(pool)
        .await?;
        
        Ok(result.id)
    }

    pub async fn find_by_chat(
        chat_id: i64,
        limit: Option<i64>,
        offset: Option<i64>,
        pool: &PgPool
    ) -> Result<Vec<Message>, sqlx::Error> {
        let limit = limit.unwrap_or(50);
        let offset = offset.unwrap_or(0);

        let messages = sqlx::query!(
            "SELECT id, chat_id, sender_id, content, message_type, 
                    created_at::text, is_edited, edited_at::text 
             FROM messages 
             WHERE chat_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2 OFFSET $3",
            chat_id,
            limit,
            offset
        )
        .fetch_all(pool)
        .await?
        .into_iter()
        .map(|row| Message {
            id: Some(row.id),
            chat_id: row.chat_id,
            sender_id: row.sender_id,
            content: row.content,
            message_type: match row.message_type.as_str() {
                "text" => MessageType::Text,
                "image" => MessageType::Image,
                "file" => MessageType::File,
                "system" => MessageType::System,
                _ => MessageType::Text,
            },
            created_at: row.created_at,
            is_edited: row.is_edited,
            edited_at: row.edited_at,
        })
        .collect();
        
        Ok(messages)
    }

    pub fn new(
        chat_id: i64,
        sender_id: i64,
        content: String,
        message_type: MessageType,
    ) -> Result<Self, String> {
        if content.is_empty() {
            return Err("Message content cannot be empty".to_string());
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
