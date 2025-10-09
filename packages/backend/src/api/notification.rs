use actix_web::{web, HttpResponse, HttpRequest, Result};
use crate::core::database::Database;
use crate::domain::notification::Notification;
use crate::api::user::{self, ApiResponse};
use log::error;
use serde::{Serialize, Deserialize};

// ============================================================================
// СТРУКТУРЫ ЗАПРОСОВ И ОТВЕТОВ
// ============================================================================

#[derive(Serialize, Deserialize)]
pub struct CreateNotificationRequest {
    pub name: String,
    pub content: String,
}

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

async fn check_auth_or_unauthorized(req: &HttpRequest, db: &Database) -> Option<crate::domain::user::User> {
    user::check_auth(req, db).await
}

fn create_unauthorized_response() -> HttpResponse {
    HttpResponse::Unauthorized().json(ApiResponse::<()> {
        success: false,
        message: Some("Unauthorized".to_string()),
        data: None,
    })
}

fn create_error_response(message: &str) -> HttpResponse {
    HttpResponse::InternalServerError().json(ApiResponse::<()> {
        success: false,
        message: Some(message.to_string()),
        data: None,
    })
}

fn create_success_response<T: serde::Serialize>(message: &str, data: T) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse {
        success: true,
        message: Some(message.to_string()),
        data: Some(data),
    })
}

// ============================================================================
// API HANDLERS
// ============================================================================

/// Создание нового уведомления
pub async fn create_notification(
    req: HttpRequest,
    notification_req: web::Json<CreateNotificationRequest>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let user = check_auth_or_unauthorized(&req, &db).await;
    if user.is_none() {
        return Ok(create_unauthorized_response());
    }

    let notification = Notification {
        id: None,
        name: notification_req.name.clone(),
        content: notification_req.content.clone(),
        created_at: None,
    };

    let pool = db.get_pool();
    let create_result = notification.create(pool).await;
    
    match create_result {
        Ok(id) => Ok(create_success_response("Notification created successfully", id)),
        Err(e) => {
            error!("Failed to create notification: {}", e);
            Ok(create_error_response("Failed to create notification"))
        }
    }
}

/// Получение всех уведомлений
pub async fn get_notifications(
    req: HttpRequest,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let user = check_auth_or_unauthorized(&req, &db).await;
    if user.is_none() {
        return Ok(create_unauthorized_response());
    }

    let pool = db.get_pool();
    let notifications_result = Notification::find_all(pool).await;
    
    match notifications_result {
        Ok(notifications) => {
            Ok(HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: None,
                data: Some(notifications),
            }))
        },
        Err(e) => {
            error!("Failed to fetch notifications: {}", e);
            Ok(create_error_response("Failed to fetch notifications"))
        }
    }
}

/// Удаление уведомления по ID
pub async fn delete_notification(
    req: HttpRequest,
    path: web::Path<i64>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let notification_id = path.into_inner();
    
    let user = check_auth_or_unauthorized(&req, &db).await;
    if user.is_none() {
        return Ok(create_unauthorized_response());
    }

    let pool = db.get_pool();
    let delete_result = Notification::delete(notification_id, pool).await;
    
    match delete_result {
        Ok(()) => Ok(create_success_response("Notification deleted successfully", ())),
        Err(e) => {
            error!("Failed to delete notification: {}", e);
            Ok(create_error_response("Failed to delete notification"))
        }
    }
}

/// Обновление уведомления
pub async fn update_notification(
    req: HttpRequest,
    path: web::Path<i64>,
    notification_req: web::Json<CreateNotificationRequest>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let notification_id = path.into_inner();
    
    let user = check_auth_or_unauthorized(&req, &db).await;
    if user.is_none() {
        return Ok(create_unauthorized_response());
    }

    let notification = Notification {
        id: Some(notification_id),
        name: notification_req.name.clone(),
        content: notification_req.content.clone(),
        created_at: None,
    };

    let pool = db.get_pool();
    let update_result = notification.update(pool).await;
    
    match update_result {
        Ok(()) => Ok(create_success_response("Notification updated successfully", notification)),
        Err(e) => {
            error!("Failed to update notification: {}", e);
            Ok(create_error_response("Failed to update notification"))
        }
    }
}
