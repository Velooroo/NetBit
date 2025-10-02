//! API обработчики для чатов и сообщений

use actix_web::{web, HttpResponse, Result};
use serde::{Deserialize, Serialize};
use log::{debug, error};

use crate::core::database::Database;
use crate::storage::cache::MessageCache;
use crate::storage::repository::{ChatRepository, MessageRepository};
use crate::domain::chat::{Chat, Message, ChatType, MessageType, ChatRole};

// ============================================================================
// СТРУКТУРЫ ЗАПРОСОВ И ОТВЕТОВ
// ============================================================================

#[derive(Deserialize)]
pub struct CreateChatRequest {
    pub name: String,
    pub chat_type: String, // "direct", "group", "channel"
    pub participants: Vec<i64>, // ID участников
}

#[derive(Deserialize)]
pub struct SendMessageRequest {
    pub content: String,
    pub message_type: Option<String>, // "text", "image", "file", "system"
}

#[derive(Serialize)]
pub struct ChatResponse {
    pub id: i64,
    pub name: String,
    pub chat_type: String,
    pub creator_id: i64,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub participants_count: i64,
    pub last_message: Option<MessageResponse>,
}

#[derive(Serialize)]
pub struct MessageResponse {
    pub id: i64,
    pub chat_id: i64,
    pub sender_id: i64,
    pub content: String,
    pub message_type: String,
    pub created_at: Option<String>,
    pub is_edited: bool,
    pub edited_at: Option<String>,
}

#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: Option<String>,
    pub data: Option<T>,
}

#[derive(Serialize)]
pub struct PaginatedResponse<T> {
    pub success: bool,
    pub data: Vec<T>,
    pub pagination: PaginationInfo,
}

#[derive(Serialize)]
pub struct PaginationInfo {
    pub page: u32,
    pub per_page: u32,
    pub total: u32,
    pub total_pages: u32,
}

// ============================================================================
// API ОБРАБОТЧИКИ
// ============================================================================

/// Получить список чатов пользователя
pub async fn get_chats(
    cache: web::Data<MessageCache>,
    query: web::Query<serde_json::Value>,
) -> Result<HttpResponse> {
    // TODO: Получить user_id из токена авторизации
    let user_id = 1i64; // Временно захардкожено
    
    debug!("Получение чатов для пользователя: {} из кеша", user_id);
    
    // Читаем из кеша вместо БД
    let chats = cache.get_user_chats(user_id);
    
    let chat_responses: Vec<ChatResponse> = chats.into_iter().map(|chat| {
        let chat_type_str = match chat.chat_type {
            ChatType::Direct => "direct",
            ChatType::Group => "group", 
            ChatType::Channel => "channel",
        };
        
        ChatResponse {
            id: chat.id.unwrap_or(0),
            name: chat.name,
            chat_type: chat_type_str.to_string(),
            creator_id: chat.creator_id,
            created_at: chat.created_at,
            updated_at: chat.updated_at,
            participants_count: 0, // TODO: Подсчитать участников
            last_message: None, // TODO: Получить последнее сообщение
        }
    }).collect();
    
    Ok(HttpResponse::Ok().json(ApiResponse {
        success: true,
        message: None,
        data: Some(chat_responses),
    }))
}

/// Получить конкретный чат
pub async fn get_chat(
    cache: web::Data<MessageCache>,
    path: web::Path<i64>,
) -> Result<HttpResponse> {
    let chat_id = path.into_inner();
    
    debug!("Получение чата: {} из кеша", chat_id);
    
    // Читаем из кеша
    match cache.get_chat(chat_id) {
        Some(chat) => {
            let chat_type_str = match chat.chat_type {
                ChatType::Direct => "direct",
                ChatType::Group => "group",
                ChatType::Channel => "channel",
            };
            
            let response = ChatResponse {
                id: chat.id.unwrap_or(0),
                name: chat.name,
                chat_type: chat_type_str.to_string(),
                creator_id: chat.creator_id,
                created_at: chat.created_at,
                updated_at: chat.updated_at,
                participants_count: 0, // TODO: Подсчитать участников
                last_message: None, // TODO: Получить последнее сообщение
            };
            
            Ok(HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: None,
                data: Some(response),
            }))
        }
        None => {
            Ok(HttpResponse::NotFound().json(ApiResponse::<ChatResponse> {
                success: false,
                message: Some("Чат не найден".to_string()),
                data: None,
            }))
        }
    }
}

/// Создать новый чат
pub async fn create_chat(
    db: web::Data<Database>,
    cache: web::Data<MessageCache>,
    req: web::Json<CreateChatRequest>,
) -> Result<HttpResponse> {
    // TODO: Получить user_id из токена авторизации
    let creator_id = 1i64; // Временно захардкожено
    
    debug!("Создание чата: {}", req.name);
    
    let chat_type = match req.chat_type.as_str() {
        "direct" => ChatType::Direct,
        "group" => ChatType::Group,
        "channel" => ChatType::Channel,
        _ => ChatType::Group,
    };
    
    let chat = Chat {
        id: None,
        name: req.name.clone(),
        chat_type,
        creator_id,
        created_at: None,
        updated_at: None,
    };
    
    // Записываем в БД через repository
    let repo = ChatRepository::new(db.connection.clone());
    match repo.create_chat(&chat) {
        Ok(chat_id) => {
            // Добавляем участников
            for user_id in &req.participants {
                if let Err(e) = repo.add_participant(chat_id, *user_id, "member") {
                    error!("Ошибка добавления участника: {}", e);
                }
                
                // Добавляем в индекс кеша
                if let Err(e) = cache.add_chat_participant(chat_id, *user_id) {
                    error!("Ошибка добавления участника в кеш: {}", e);
                }
            }
            
            // Добавляем создателя как админа
            if let Err(e) = repo.add_participant(chat_id, creator_id, "admin") {
                error!("Ошибка добавления создателя: {}", e);
            }
            if let Err(e) = cache.add_chat_participant(chat_id, creator_id) {
                error!("Ошибка добавления создателя в кеш: {}", e);
            }
            
            // Добавляем чат в кеш
            let mut chat_with_id = chat;
            chat_with_id.id = Some(chat_id);
            if let Err(e) = cache.add_chat(chat_with_id) {
                error!("Ошибка добавления чата в кеш: {}", e);
            }
            
            Ok(HttpResponse::Created().json(ApiResponse {
                success: true,
                message: Some("Чат успешно создан".to_string()),
                data: Some(serde_json::json!({ "id": chat_id })),
            }))
        }
        Err(e) => {
            error!("Ошибка при создании чата: {}", e);
            Ok(HttpResponse::InternalServerError().json(ApiResponse::<serde_json::Value> {
                success: false,
                message: Some("Ошибка при создании чата".to_string()),
                data: None,
            }))
        }
    }
}

/// Получить сообщения чата
pub async fn get_messages(
    cache: web::Data<MessageCache>,
    path: web::Path<i64>,
    query: web::Query<serde_json::Value>,
) -> Result<HttpResponse> {
    let chat_id = path.into_inner();
    let page = query.get("page")
        .and_then(|v| v.as_u64())
        .unwrap_or(1) as u32;
    let per_page = query.get("per_page")
        .and_then(|v| v.as_u64())
        .unwrap_or(50) as u32;
    
    debug!("Получение сообщений чата {} из кеша (страница: {}, на странице: {})", chat_id, page, per_page);
    
    // Читаем из кеша
    let messages = cache.get_messages(chat_id, page, per_page);
    
    let message_responses: Vec<MessageResponse> = messages.into_iter().map(|msg| {
        let message_type_str = match msg.message_type {
            MessageType::Text => "text",
            MessageType::Image => "image",
            MessageType::File => "file",
            MessageType::System => "system",
        };
        
        MessageResponse {
            id: msg.id.unwrap_or(0),
            chat_id: msg.chat_id,
            sender_id: msg.sender_id,
            content: msg.content,
            message_type: message_type_str.to_string(),
            created_at: msg.created_at,
            is_edited: msg.is_edited,
            edited_at: msg.edited_at,
        }
    }).collect();
    
    // TODO: Получить общее количество сообщений для пагинации
    let total = cache.get_message_count(chat_id) as u32;
    let total_pages = (total + per_page - 1) / per_page;
    
    Ok(HttpResponse::Ok().json(PaginatedResponse {
        success: true,
        data: message_responses,
        pagination: PaginationInfo {
            page,
            per_page,
            total,
            total_pages,
        },
    }))
}

/// Отправить сообщение в чат
pub async fn send_message(
    db: web::Data<Database>,
    cache: web::Data<MessageCache>,
    path: web::Path<i64>,
    req: web::Json<SendMessageRequest>,
) -> Result<HttpResponse> {
    let chat_id = path.into_inner();
    // TODO: Получить user_id из токена авторизации
    let sender_id = 1i64; // Временно захардкожено
    
    debug!("Отправка сообщения в чат {}", chat_id);
    
    let message_type = match req.message_type.as_deref().unwrap_or("text") {
        "image" => MessageType::Image,
        "file" => MessageType::File,
        "system" => MessageType::System,
        _ => MessageType::Text,
    };
    
    match Message::new(chat_id, sender_id, req.content.clone(), message_type) {
        Ok(message) => {
            // Записываем в БД через repository
            let repo = MessageRepository::new(db.connection.clone());
            match repo.create_message(&message) {
                Ok(message_id) => {
                    // Добавляем в кеш
                    let mut msg_with_id = message;
                    msg_with_id.id = Some(message_id);
                    
                    if let Err(e) = cache.add_message(msg_with_id) {
                        error!("Ошибка добавления сообщения в кеш: {}", e);
                    }
                    
                    Ok(HttpResponse::Created().json(ApiResponse {
                        success: true,
                        message: Some("Сообщение отправлено".to_string()),
                        data: Some(serde_json::json!({ "id": message_id })),
                    }))
                }
                Err(e) => {
                    error!("Ошибка при сохранении сообщения: {}", e);
                    Ok(HttpResponse::InternalServerError().json(ApiResponse::<serde_json::Value> {
                        success: false,
                        message: Some("Ошибка при отправке сообщения".to_string()),
                        data: None,
                    }))
                }
            }
        }
        Err(validation_error) => {
            Ok(HttpResponse::BadRequest().json(ApiResponse::<serde_json::Value> {
                success: false,
                message: Some(validation_error),
                data: None,
            }))
        }
    }
}
