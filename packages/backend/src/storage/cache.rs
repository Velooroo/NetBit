//! In-memory кеш для быстрого доступа к данным
//!
//! Кеш хранит активные данные в памяти приложения для быстрого чтения.
//! База данных используется только для записи (write-only).
//! При старте приложения кеш загружается из БД.

use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use rusqlite::Connection;
use log::{debug, info, error};

use crate::domain::chat::{Chat, Message, ChatType, MessageType};

/// Кеш для чатов и сообщений
#[derive(Clone)]
pub struct MessageCache {
    /// Чаты: chat_id -> Chat
    chats: Arc<RwLock<HashMap<i64, Chat>>>,
    /// Сообщения: chat_id -> Vec<Message>
    messages: Arc<RwLock<HashMap<i64, Vec<Message>>>>,
    /// Индекс пользователей: user_id -> Vec<chat_id>
    user_chats: Arc<RwLock<HashMap<i64, Vec<i64>>>>,
}

impl MessageCache {
    /// Создает новый пустой кеш
    pub fn new() -> Self {
        info!("Инициализация кеша сообщений");
        Self {
            chats: Arc::new(RwLock::new(HashMap::new())),
            messages: Arc::new(RwLock::new(HashMap::new())),
            user_chats: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Загружает данные из базы данных в кеш
    pub fn load_from_db(&self, conn: Arc<std::sync::Mutex<Connection>>) -> Result<(), String> {
        info!("Загрузка данных из БД в кеш");
        
        let conn_guard = conn.lock().map_err(|e| format!("Ошибка блокировки: {}", e))?;

        // Загружаем чаты
        let mut stmt = conn_guard.prepare("SELECT id, name, chat_type, creator_id, created_at, updated_at FROM chats")
            .map_err(|e| format!("Ошибка подготовки запроса чатов: {}", e))?;
        
        let chats_iter = stmt.query_map([], |row| {
            let chat_type_str: String = row.get(2)?;
            let chat_type = match chat_type_str.as_str() {
                "direct" => ChatType::Direct,
                "group" => ChatType::Group,
                "channel" => ChatType::Channel,
                _ => ChatType::Group,
            };

            Ok(Chat {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                chat_type,
                creator_id: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        }).map_err(|e| format!("Ошибка запроса чатов: {}", e))?;

        let mut chats_cache = self.chats.write().map_err(|e| format!("Ошибка записи в кеш чатов: {}", e))?;
        let mut user_chats_cache = self.user_chats.write().map_err(|e| format!("Ошибка записи в кеш пользователей: {}", e))?;
        
        for chat_result in chats_iter {
            if let Ok(chat) = chat_result {
                if let Some(chat_id) = chat.id {
                    chats_cache.insert(chat_id, chat.clone());
                    
                    // Загружаем участников чата
                    let mut participants_stmt = conn_guard.prepare(
                        "SELECT user_id FROM chat_participants WHERE chat_id = ?1"
                    ).map_err(|e| format!("Ошибка подготовки запроса участников: {}", e))?;
                    
                    let user_ids = participants_stmt.query_map([chat_id], |row| {
                        row.get::<_, i64>(0)
                    }).map_err(|e| format!("Ошибка запроса участников: {}", e))?;

                    for user_id_result in user_ids {
                        if let Ok(user_id) = user_id_result {
                            user_chats_cache.entry(user_id).or_insert_with(Vec::new).push(chat_id);
                        }
                    }
                }
            }
        }

        drop(chats_cache);
        drop(user_chats_cache);

        info!("Загружено {} чатов", self.chats.read().unwrap().len());

        // Загружаем сообщения (только последние N для каждого чата, чтобы не перегружать память)
        let max_messages_per_chat = 100;
        let mut messages_cache = self.messages.write().map_err(|e| format!("Ошибка записи в кеш сообщений: {}", e))?;

        for chat_id in self.chats.read().unwrap().keys() {
            let mut stmt = conn_guard.prepare(
                "SELECT id, chat_id, sender_id, content, message_type, created_at, is_edited, edited_at 
                 FROM messages 
                 WHERE chat_id = ?1 
                 ORDER BY created_at DESC 
                 LIMIT ?2"
            ).map_err(|e| format!("Ошибка подготовки запроса сообщений: {}", e))?;

            let messages_iter = stmt.query_map([chat_id, &max_messages_per_chat], |row| {
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
            }).map_err(|e| format!("Ошибка запроса сообщений: {}", e))?;

            let mut messages_vec = Vec::new();
            for msg_result in messages_iter {
                if let Ok(msg) = msg_result {
                    messages_vec.push(msg);
                }
            }
            
            // Разворачиваем, чтобы старые сообщения были первыми
            messages_vec.reverse();
            messages_cache.insert(*chat_id, messages_vec);
        }

        info!("Загружено сообщений для {} чатов", messages_cache.len());

        Ok(())
    }

    /// Получает чат по ID из кеша
    pub fn get_chat(&self, chat_id: i64) -> Option<Chat> {
        self.chats.read().ok()?.get(&chat_id).cloned()
    }

    /// Получает все чаты пользователя из кеша
    pub fn get_user_chats(&self, user_id: i64) -> Vec<Chat> {
        let user_chats = self.user_chats.read().ok();
        let chats = self.chats.read().ok();

        if let (Some(user_chats), Some(chats)) = (user_chats, chats) {
            if let Some(chat_ids) = user_chats.get(&user_id) {
                return chat_ids.iter()
                    .filter_map(|id| chats.get(id).cloned())
                    .collect();
            }
        }

        Vec::new()
    }

    /// Получает сообщения чата из кеша с пагинацией
    pub fn get_messages(&self, chat_id: i64, page: u32, per_page: u32) -> Vec<Message> {
        if let Ok(messages) = self.messages.read() {
            if let Some(chat_messages) = messages.get(&chat_id) {
                let offset = ((page - 1) * per_page) as usize;
                let end = (offset + per_page as usize).min(chat_messages.len());
                
                return chat_messages.get(offset..end)
                    .map(|slice| slice.to_vec())
                    .unwrap_or_default();
            }
        }

        Vec::new()
    }

    /// Добавляет чат в кеш
    pub fn add_chat(&self, chat: Chat) -> Result<(), String> {
        if let Some(chat_id) = chat.id {
            let mut chats = self.chats.write().map_err(|e| format!("Ошибка записи чата: {}", e))?;
            chats.insert(chat_id, chat);
            debug!("Чат {} добавлен в кеш", chat_id);
            Ok(())
        } else {
            Err("Чат не имеет ID".to_string())
        }
    }

    /// Добавляет участника чата в индекс
    pub fn add_chat_participant(&self, chat_id: i64, user_id: i64) -> Result<(), String> {
        let mut user_chats = self.user_chats.write().map_err(|e| format!("Ошибка записи участника: {}", e))?;
        user_chats.entry(user_id).or_insert_with(Vec::new).push(chat_id);
        debug!("Пользователь {} добавлен в чат {}", user_id, chat_id);
        Ok(())
    }

    /// Добавляет сообщение в кеш
    pub fn add_message(&self, message: Message) -> Result<(), String> {
        let mut messages = self.messages.write().map_err(|e| format!("Ошибка записи сообщения: {}", e))?;
        let chat_messages = messages.entry(message.chat_id).or_insert_with(Vec::new);
        chat_messages.push(message.clone());
        debug!("Сообщение добавлено в кеш для чата {}", message.chat_id);
        Ok(())
    }

    /// Получает количество сообщений в чате
    pub fn get_message_count(&self, chat_id: i64) -> usize {
        if let Ok(messages) = self.messages.read() {
            if let Some(chat_messages) = messages.get(&chat_id) {
                return chat_messages.len();
            }
        }
        0
    }

    /// Сохраняет состояние кеша в базу данных (для graceful shutdown)
    pub fn persist_to_db(&self, _conn: Arc<std::sync::Mutex<Connection>>) -> Result<(), String> {
        info!("Сохранение состояния кеша в БД");
        // Все данные уже в БД, так как мы пишем туда синхронно
        // Эта функция может быть использована для дополнительной проверки или синхронизации
        Ok(())
    }

    /// Очищает кеш
    pub fn clear(&self) -> Result<(), String> {
        info!("Очистка кеша");
        self.chats.write().map_err(|e| format!("Ошибка очистки чатов: {}", e))?.clear();
        self.messages.write().map_err(|e| format!("Ошибка очистки сообщений: {}", e))?.clear();
        self.user_chats.write().map_err(|e| format!("Ошибка очистки индекса пользователей: {}", e))?.clear();
        Ok(())
    }
}

impl Default for MessageCache {
    fn default() -> Self {
        Self::new()
    }
}
