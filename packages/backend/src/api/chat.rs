//! API обработчики для чатов и сообщений

use actix_web::{web, HttpResponse, Result};
use serde::{Deserialize, Serialize};
use log::{debug, error};

use crate::core::database::Database;
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
    db: web::Data<Database>,
    query: web::Query<serde_json::Value>,
) -> Result<HttpResponse> {
    // TODO: Получить user_id из токена авторизации
    let user_id = 1i64; // Временно захардкожено
    
    debug!("Получение чатов для пользователя: {}", user_id);
    
    match Chat::find_by_user(user_id, db.get_pool()).await {
        Ok(chats) => {
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
        Err(e) => {
            error!("Ошибка при получении чатов: {}", e);
            Ok(HttpResponse::InternalServerError().json(ApiResponse::<Vec<ChatResponse>> {
                success: false,
                message: Some("Ошибка при получении чатов".to_string()),
                data: None,
            }))
        }
    }
}

/// Получить конкретный чат
pub async fn get_chat(
    db: web::Data<Database>,
    path: web::Path<i64>,
) -> Result<HttpResponse> {
    let chat_id = path.into_inner();
    
    debug!("Получение чата: {}", chat_id);
    
    match Chat::find_by_id(chat_id, db.get_pool()).await {
        Ok(Some(chat)) => {
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
        Ok(None) => {
            Ok(HttpResponse::NotFound().json(ApiResponse::<ChatResponse> {
                success: false,
                message: Some("Чат не найден".to_string()),
                data: None,
            }))
        }
        Err(e) => {
            error!("Ошибка при получении чата: {}", e);
            Ok(HttpResponse::InternalServerError().json(ApiResponse::<ChatResponse> {
                success: false,
                message: Some("Ошибка при получении чата".to_string()),
                data: None,
            }))
        }
    }
}

/// Создать новый чат
pub async fn create_chat(
    db: web::Data<Database>,
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
    
    match chat.create(db.get_pool()).await {
        Ok(chat_id) => {
            // Добавляем участников
            for &participant_id in &req.participants {
                if participant_id != creator_id {
                    let _ = chat.add_participant(participant_id, ChatRole::Member, db.get_pool()).await;
                }
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
    db: web::Data<Database>,
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
    
    debug!("Получение сообщений чата {} (страница: {}, на странице: {})", chat_id, page, per_page);
    
    match Message::find_by_chat(chat_id, page, per_page, db.connection.clone()) {
        Ok(messages) => {
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
            let total = message_responses.len() as u32;
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
        Err(e) => {
            error!("Ошибка при получении сообщений: {}", e);
            Ok(HttpResponse::InternalServerError().json(ApiResponse::<Vec<MessageResponse>> {
                success: false,
                message: Some("Ошибка при получении сообщений".to_string()),
                data: None,
            }))
        }
    }
}

/// Отправить сообщение в чат
pub async fn send_message(
    db: web::Data<Database>,
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
            match message.create(db.get_pool()).await {
                Ok(message_id) => {
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
