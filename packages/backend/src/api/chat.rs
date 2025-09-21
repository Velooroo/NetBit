//! API обработчики для чатов и сообщений с использованием новой ORM

use actix_web::{web, HttpResponse, HttpRequest, Result};
use crate::core::database::Database;
use crate::domain::chat::{
    Chat, Message, ChatMember, ChatType, MessageType, ChatRole,
    ChatWithLastMessage, ChatRepository, MessageRepository, ChatMemberRepository
};
use crate::domain::user::{UserRepository};
use crate::core::auth::Claims;
use log::{error, info};
use serde::{Serialize, Deserialize};

// ============================================================================
// СТРУКТУРЫ ЗАПРОСОВ И ОТВЕТОВ
// ============================================================================

#[derive(Serialize, Deserialize)]
pub struct CreateChatRequest {
    pub name: String,
    pub description: Option<String>,
    pub chat_type: String, // "direct", "group", "channel"
    pub members: Vec<i64>, // ID пользователей для добавления в чат
}

#[derive(Serialize, Deserialize)]
pub struct SendMessageRequest {
    pub content: String,
    pub message_type: Option<String>, // "text", "image", "file"
    pub reply_to: Option<i64>, // ID сообщения, на которое отвечаем
}

#[derive(Serialize, Deserialize)]
pub struct AddMemberRequest {
    pub user_id: i64,
    pub role: Option<String>, // "member", "moderator", "admin"
}

#[derive(Serialize, Deserialize)]
pub struct MessageQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: Option<String>,
    pub data: Option<T>,
}

#[derive(Serialize)]
pub struct ChatResponse {
    pub chat: Chat,
    pub members: Vec<ChatMember>,
    pub last_message: Option<Message>,
    pub unread_count: i64,
}

#[derive(Serialize)]
pub struct MessagesResponse {
    pub messages: Vec<MessageWithSender>,
    pub total: i64,
    pub has_more: bool,
}

#[derive(Serialize)]
pub struct MessageWithSender {
    #[serde(flatten)]
    pub message: Message,
    pub sender_username: String,
    pub sender_avatar: Option<String>,
}

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

fn create_error_response(message: &str) -> HttpResponse {
    HttpResponse::InternalServerError().json(ApiResponse::<()> {
        success: false,
        message: Some(message.to_string()),
        data: None,
    })
}

fn create_success_response<T: Serialize>(data: T) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse {
        success: true,
        message: None,
        data: Some(data),
    })
}

fn extract_user_from_request(req: &HttpRequest) -> Result<i64, HttpResponse> {
    if let Some(user) = req.extensions().get::<Claims>() {
        Ok(user.user_id)
    } else {
        Err(HttpResponse::Unauthorized().json(ApiResponse::<()> {
            success: false,
            message: Some("Unauthorized".to_string()),
            data: None,
        }))
    }
}

// ============================================================================
// API HANDLERS
// ============================================================================

/// Получение списка чатов пользователя
pub async fn get_user_chats(
    req: HttpRequest,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let user_id = match extract_user_from_request(&req) {
        Ok(id) => id,
        Err(response) => return Ok(response),
    };
    
    let chat_repo = ChatRepository::new(db.get_connection());
    
    let chats = match chat_repo.get_user_chats(user_id) {
        Ok(chats) => chats,
        Err(e) => {
            error!("Failed to get user chats: {}", e);
            return Ok(create_error_response("Failed to get chats"));
        }
    };
    
    Ok(create_success_response(chats))
}

/// Создание нового чата
pub async fn create_chat(
    req: HttpRequest,
    create_req: web::Json<CreateChatRequest>,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let user_id = match extract_user_from_request(&req) {
        Ok(id) => id,
        Err(response) => return Ok(response),
    };
    
    let chat_repo = ChatRepository::new(db.get_connection());
    let member_repo = ChatMemberRepository::new(db.get_connection());
    let user_repo = UserRepository::new(db.get_connection());
    
    // Проверяем, что все участники существуют
    for member_id in &create_req.members {
        if user_repo.find_by_id(*member_id).unwrap_or(None).is_none() {
            return Ok(HttpResponse::BadRequest().json(ApiResponse::<()> {
                success: false,
                message: Some(format!("User with ID {} not found", member_id)),
                data: None,
            }));
        }
    }
    
    // Создаём чат
    let chat = Chat {
        id: None,
        name: create_req.name.clone(),
        description: create_req.description.clone(),
        chat_type: ChatType::from_string(&create_req.chat_type),
        creator_id: user_id,
        avatar: None,
        is_active: true,
        created_at: Some(chrono::Utc::now()),
        updated_at: Some(chrono::Utc::now()),
    };
    
    let created_chat = match chat_repo.create_chat(chat) {
        Ok(chat) => chat,
        Err(e) => {
            error!("Failed to create chat: {}", e);
            return Ok(create_error_response("Failed to create chat"));
        }
    };
    
    let chat_id = created_chat.id.unwrap();
    
    // Добавляем создателя как владельца
    if let Err(e) = member_repo.add_member(chat_id, user_id, ChatRole::Owner) {
        error!("Failed to add creator to chat: {}", e);
    }
    
    // Добавляем остальных участников
    for member_id in &create_req.members {
        if *member_id != user_id {
            if let Err(e) = member_repo.add_member(chat_id, *member_id, ChatRole::Member) {
                error!("Failed to add member {} to chat: {}", member_id, e);
            }
        }
    }
    
    // Получаем полную информацию о чате
    let members = member_repo.get_chat_members(chat_id).unwrap_or_default();
    let response = ChatResponse {
        chat: created_chat,
        members,
        last_message: None,
        unread_count: 0,
    };
    
    info!("Created chat {} by user {}", chat_id, user_id);
    
    Ok(create_success_response(response))
}

/// Получение информации о чате
pub async fn get_chat(
    req: HttpRequest,
    path: web::Path<i64>,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let user_id = match extract_user_from_request(&req) {
        Ok(id) => id,
        Err(response) => return Ok(response),
    };
    
    let chat_id = path.into_inner();
    let chat_repo = ChatRepository::new(db.get_connection());
    let member_repo = ChatMemberRepository::new(db.get_connection());
    
    // Проверяем, является ли пользователь участником чата
    let members = match member_repo.get_chat_members(chat_id) {
        Ok(members) => members,
        Err(e) => {
            error!("Failed to get chat members: {}", e);
            return Ok(create_error_response("Failed to get chat information"));
        }
    };
    
    let is_member = members.iter().any(|m| m.user_id == user_id);
    if !is_member {
        return Ok(HttpResponse::Forbidden().json(ApiResponse::<()> {
            success: false,
            message: Some("Access denied".to_string()),
            data: None,
        }));
    }
    
    // Получаем информацию о чате
    let chat = match chat_repo.find_by_id(chat_id) {
        Ok(Some(chat)) => chat,
        Ok(None) => return Ok(HttpResponse::NotFound().json(ApiResponse::<()> {
            success: false,
            message: Some("Chat not found".to_string()),
            data: None,
        })),
        Err(e) => {
            error!("Database error: {}", e);
            return Ok(create_error_response("Database error"));
        }
    };
    
    // Получаем последнее сообщение и количество непрочитанных
    let last_message = chat_repo.get_last_message(chat_id).ok().flatten();
    let unread_count = chat_repo.get_unread_count(chat_id, user_id).unwrap_or(0);
    
    let response = ChatResponse {
        chat,
        members,
        last_message,
        unread_count,
    };
    
    Ok(create_success_response(response))
}

/// Получение сообщений чата
pub async fn get_chat_messages(
    req: HttpRequest,
    path: web::Path<i64>,
    query: web::Query<MessageQuery>,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let user_id = match extract_user_from_request(&req) {
        Ok(id) => id,
        Err(response) => return Ok(response),
    };
    
    let chat_id = path.into_inner();
    let limit = query.limit.unwrap_or(50).min(100); // Максимум 100 сообщений за раз
    let offset = query.offset.unwrap_or(0);
    
    let member_repo = ChatMemberRepository::new(db.get_connection());
    let message_repo = MessageRepository::new(db.get_connection());
    let user_repo = UserRepository::new(db.get_connection());
    
    // Проверяем, является ли пользователь участником чата
    let members = match member_repo.get_chat_members(chat_id) {
        Ok(members) => members,
        Err(e) => {
            error!("Failed to get chat members: {}", e);
            return Ok(create_error_response("Failed to get chat information"));
        }
    };
    
    let is_member = members.iter().any(|m| m.user_id == user_id);
    if !is_member {
        return Ok(HttpResponse::Forbidden().json(ApiResponse::<()> {
            success: false,
            message: Some("Access denied".to_string()),
            data: None,
        }));
    }
    
    // Получаем сообщения
    let messages = match message_repo.get_chat_messages(chat_id, limit, offset) {
        Ok(messages) => messages,
        Err(e) => {
            error!("Failed to get messages: {}", e);
            return Ok(create_error_response("Failed to get messages"));
        }
    };
    
    // Добавляем информацию об отправителях
    let mut messages_with_senders = Vec::new();
    for message in messages {
        let sender = user_repo.find_by_id(message.sender_id).ok().flatten();
        let sender_username = sender.as_ref()
            .map(|u| u.username.clone())
            .unwrap_or_else(|| "Unknown".to_string());
        let sender_avatar = sender.as_ref()
            .and_then(|u| u.avatar.clone());
        
        messages_with_senders.push(MessageWithSender {
            message,
            sender_username,
            sender_avatar,
        });
    }
    
    let has_more = messages_with_senders.len() as i64 == limit;
    let response = MessagesResponse {
        messages: messages_with_senders,
        total: 0, // Можно добавить подсчёт общего количества
        has_more,
    };
    
    // Отмечаем сообщения как прочитанные
    if let Err(e) = message_repo.mark_messages_as_read(chat_id, user_id) {
        error!("Failed to mark messages as read: {}", e);
    }
    
    Ok(create_success_response(response))
}

/// Отправка сообщения в чат
pub async fn send_message(
    req: HttpRequest,
    path: web::Path<i64>,
    message_req: web::Json<SendMessageRequest>,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let user_id = match extract_user_from_request(&req) {
        Ok(id) => id,
        Err(response) => return Ok(response),
    };
    
    let chat_id = path.into_inner();
    let member_repo = ChatMemberRepository::new(db.get_connection());
    let message_repo = MessageRepository::new(db.get_connection());
    let user_repo = UserRepository::new(db.get_connection());
    
    // Проверяем, является ли пользователь участником чата
    let members = match member_repo.get_chat_members(chat_id) {
        Ok(members) => members,
        Err(e) => {
            error!("Failed to get chat members: {}", e);
            return Ok(create_error_response("Failed to send message"));
        }
    };
    
    let is_member = members.iter().any(|m| m.user_id == user_id);
    if !is_member {
        return Ok(HttpResponse::Forbidden().json(ApiResponse::<()> {
            success: false,
            message: Some("Access denied".to_string()),
            data: None,
        }));
    }
    
    // Создаём сообщение
    let message = Message {
        id: None,
        chat_id,
        sender_id: user_id,
        content: message_req.content.clone(),
        message_type: MessageType::from_string(
            &message_req.message_type.as_deref().unwrap_or("text")
        ),
        reply_to: message_req.reply_to,
        is_read: false,
        is_edited: false,
        created_at: Some(chrono::Utc::now()),
        updated_at: Some(chrono::Utc::now()),
    };
    
    let created_message = match message_repo.create_message(message) {
        Ok(message) => message,
        Err(e) => {
            error!("Failed to create message: {}", e);
            return Ok(create_error_response("Failed to send message"));
        }
    };
    
    // Добавляем информацию об отправителе
    let sender = user_repo.find_by_id(user_id).ok().flatten();
    let response = MessageWithSender {
        message: created_message,
        sender_username: sender.as_ref()
            .map(|u| u.username.clone())
            .unwrap_or_else(|| "Unknown".to_string()),
        sender_avatar: sender.as_ref()
            .and_then(|u| u.avatar.clone()),
    };
    
    info!("Message sent to chat {} by user {}", chat_id, user_id);
    
    Ok(create_success_response(response))
}

/// Добавление участника в чат
pub async fn add_member(
    req: HttpRequest,
    path: web::Path<i64>,
    add_req: web::Json<AddMemberRequest>,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let user_id = match extract_user_from_request(&req) {
        Ok(id) => id,
        Err(response) => return Ok(response),
    };
    
    let chat_id = path.into_inner();
    let member_repo = ChatMemberRepository::new(db.get_connection());
    let user_repo = UserRepository::new(db.get_connection());
    
    // Проверяем права пользователя (должен быть админом или создателем)
    let members = match member_repo.get_chat_members(chat_id) {
        Ok(members) => members,
        Err(e) => {
            error!("Failed to get chat members: {}", e);
            return Ok(create_error_response("Failed to add member"));
        }
    };
    
    let user_member = members.iter().find(|m| m.user_id == user_id);
    match user_member {
        Some(member) => {
            match member.role {
                ChatRole::Owner | ChatRole::Admin => {},
                _ => return Ok(HttpResponse::Forbidden().json(ApiResponse::<()> {
                    success: false,
                    message: Some("Insufficient permissions".to_string()),
                    data: None,
                }))
            }
        }
        None => return Ok(HttpResponse::Forbidden().json(ApiResponse::<()> {
            success: false,
            message: Some("Access denied".to_string()),
            data: None,
        }))
    }
    
    // Проверяем, что пользователь существует
    if user_repo.find_by_id(add_req.user_id).unwrap_or(None).is_none() {
        return Ok(HttpResponse::NotFound().json(ApiResponse::<()> {
            success: false,
            message: Some("User not found".to_string()),
            data: None,
        }));
    }
    
    // Проверяем, что пользователь ещё не в чате
    if members.iter().any(|m| m.user_id == add_req.user_id) {
        return Ok(HttpResponse::BadRequest().json(ApiResponse::<()> {
            success: false,
            message: Some("User is already a member".to_string()),
            data: None,
        }));
    }
    
    // Добавляем участника
    let role = ChatRole::from_string(&add_req.role.as_deref().unwrap_or("member"));
    let member = match member_repo.add_member(chat_id, add_req.user_id, role) {
        Ok(member) => member,
        Err(e) => {
            error!("Failed to add member: {}", e);
            return Ok(create_error_response("Failed to add member"));
        }
    };
    
    info!("Added member {} to chat {} by user {}", add_req.user_id, chat_id, user_id);
    
    Ok(create_success_response(member))
}