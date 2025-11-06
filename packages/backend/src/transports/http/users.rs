use crate::core::database::Database;
use crate::domain::users::User;
use crate::services::auth as auth_service;
use actix_web::{web, HttpRequest, HttpResponse, Result};
use log::error;
use serde::{Deserialize, Serialize};

// ============================================================================
// СТРУКТУРЫ ЗАПРОСОВ И ОТВЕТОВ
// ============================================================================

#[derive(Serialize, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Serialize, Deserialize)]
pub struct RegisterRequest {
    pub username: String,
    pub email: String,
    pub password: String,
}

#[derive(Serialize, Deserialize)]
pub struct RefreshRequest {
    pub refresh_token: String,
}

#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: Option<String>,
    pub data: Option<T>,
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

fn create_bad_request_response(message: &str) -> HttpResponse {
    HttpResponse::BadRequest().json(ApiResponse::<()> {
        success: false,
        message: Some(message.to_string()),
        data: None,
    })
}

fn create_unauthorized_response() -> HttpResponse {
    HttpResponse::Unauthorized().json(ApiResponse::<()> {
        success: false,
        message: Some("Unauthorized".to_string()),
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
// ПУБЛИЧНЫЕ ФУНКЦИИ
// ============================================================================

/// Проверка аутентификации пользователя (JWT или Basic Auth)
pub async fn check_auth(req: &HttpRequest, db: &Database) -> Option<User> {
    auth_service::authenticate_request(req, db).await
}

// ============================================================================
// API HANDLERS
// ============================================================================

/// Аутентификация пользователя
pub async fn login(
    req: HttpRequest,
    login_req: web::Json<LoginRequest>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let pool = db.get_pool();

    let user = match User::authenticate(&login_req.username, &login_req.password, pool).await {
        Ok(Some(user)) => user,
        Ok(None) => return Ok(create_bad_request_response("Invalid username or password")),
        Err(e) => {
            error!("Database error during login: {}", e);
            return Ok(create_error_response("Database error"));
        }
    };

    let user_agent = req
        .headers()
        .get("User-Agent")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());
    let ip = req.peer_addr().map(|addr| addr.ip().to_string());

    match auth_service::issue_tokens(&user, &db, user_agent, ip).await {
        Ok(tokens) => {
            let response = auth_service::AuthResponse { tokens, user };
            Ok(create_success_response("Login successful", response))
        }
        Err(e) => {
            error!("Failed to generate token pair: {}", e);
            Ok(create_error_response(
                "Failed to generate authentication tokens",
            ))
        }
    }
}

/// Регистрация нового пользователя
pub async fn register(
    register_req: web::Json<RegisterRequest>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let pool = db.get_pool();

    // Проверяем, что пользователь не существует
    match User::find_by_username(&register_req.username, pool).await {
        Ok(Some(_)) => return Ok(create_bad_request_response("Username already exists")),
        Err(e) => {
            error!("Database error during registration check: {}", e);
            return Ok(create_error_response("Database error"));
        }
        _ => {}
    }

    // Создаем нового пользователя с хэшированным паролем
    let user = match User::new(
        register_req.username.clone(),
        register_req.password.clone(),
        Some(register_req.email.clone()),
    ) {
        Ok(user) => user,
        Err(e) => return Ok(create_bad_request_response(&e)),
    };

    // Сохраняем в базу данных
    match user.create(pool).await {
        Ok(_) => Ok(create_success_response(
            "User registered successfully",
            user,
        )),
        Err(e) => {
            error!("Failed to create user: {}", e);
            Ok(create_error_response("Failed to create user"))
        }
    }
}

/// Обновление access токена по refresh токену
pub async fn refresh_token(
    req: HttpRequest,
    refresh_req: web::Json<RefreshRequest>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let user_agent = req
        .headers()
        .get("User-Agent")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());
    let ip = req.peer_addr().map(|addr| addr.ip().to_string());

    match auth_service::rotate_refresh_token(&refresh_req.refresh_token, &db, user_agent, ip).await
    {
        Ok((user, tokens)) => {
            let response = auth_service::AuthResponse { tokens, user };
            Ok(create_success_response("Token refreshed", response))
        }
        Err(e) => {
            error!("Failed to refresh token: {}", e);
            Ok(create_unauthorized_response())
        }
    }
}

/// Выход из системы по refresh токену
pub async fn logout(
    refresh_req: web::Json<RefreshRequest>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    match auth_service::revoke_single_session(&refresh_req.refresh_token, &db).await {
        Ok(_) => Ok(create_success_response("Logged out", ())),
        Err(e) => {
            error!("Failed to revoke session: {}", e);
            Ok(create_error_response("Failed to revoke session"))
        }
    }
}

/// Получение профиля текущего пользователя
pub async fn user_profile(req: HttpRequest, db: web::Data<Database>) -> Result<HttpResponse> {
    let user = check_auth(&req, &db).await;

    match user {
        Some(user) => Ok(HttpResponse::Ok().json(ApiResponse {
            success: true,
            message: None,
            data: Some(user),
        })),
        None => Ok(create_unauthorized_response()),
    }
}
