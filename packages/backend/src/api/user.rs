use actix_web::{web, HttpResponse, HttpRequest, Result};
use crate::core::database::Database;
use crate::domain::user::User;
use crate::core::auth::{Claims, generate_token_for_user};
use log::error;
use serde::{Serialize, Deserialize};
use base64::{Engine as _, engine::general_purpose};

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

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: User,
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

fn extract_basic_auth(req: &HttpRequest) -> Option<(String, String)> {
    let auth_header = req.headers().get("Authorization")?;
    let auth_str = auth_header.to_str().ok()?;
    
    if !auth_str.starts_with("Basic ") {
        return None;
    }
    
    let encoded = &auth_str[6..];
    let decoded = general_purpose::STANDARD.decode(encoded).ok()?;
    let decoded_str = String::from_utf8(decoded).ok()?;
    
    let parts: Vec<&str> = decoded_str.splitn(2, ':').collect();
    if parts.len() != 2 {
        return None;
    }
    
    Some((parts[0].to_string(), parts[1].to_string()))
}

fn extract_bearer_token(req: &HttpRequest) -> Option<String> {
    let auth_header = req.headers().get("Authorization")?;
    let auth_str = auth_header.to_str().ok()?;
    
    if !auth_str.starts_with("Bearer ") {
        return None;
    }
    
    Some(auth_str[7..].to_string())
}

// ============================================================================
// ПУБЛИЧНЫЕ ФУНКЦИИ
// ============================================================================

/// Проверка аутентификации пользователя (JWT или Basic Auth)
pub async fn check_auth(req: &HttpRequest, db: &Database) -> Option<User> {
    // Сначала пробуем JWT токен
    if let Some(token) = extract_bearer_token(req) {
        if let Ok(claims) = Claims::from_token(&token) {
            let pool = db.get_pool();
            if let Ok(Some(user)) = User::find_by_id(claims.user_id, pool).await {
                return Some(user);
            }
        }
    }
    
    // Если JWT не сработал, пробуем Basic Auth для обратной совместимости
    if let Some((username, password)) = extract_basic_auth(req) {
        let pool = db.get_pool();
        if let Ok(Some(user)) = User::authenticate(&username, &password, pool).await {
            return Some(user);
        }
    }
    
    None
}

// ============================================================================
// API HANDLERS
// ============================================================================

/// Аутентификация пользователя
pub async fn login(
    login_req: web::Json<LoginRequest>,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let pool = db.get_pool();
    
    // Находим пользователя и проверяем пароль
    let user = match User::authenticate(&login_req.username, &login_req.password, pool).await {
        Ok(Some(user)) => user,
        Ok(None) => return Ok(create_bad_request_response("Invalid username or password")),
        Err(e) => {
            error!("Database error during login: {}", e);
            return Ok(create_error_response("Database error"));
        }
    };
    
    // Генерируем JWT токен
    let token_result = generate_token_for_user(&user);
    let token = match token_result {
        Ok(response) => response.token,
        Err(e) => {
            error!("Failed to generate token: {}", e);
            return Ok(create_error_response("Failed to generate authentication token"));
        }
    };
    
    let response = LoginResponse { token, user };
    Ok(create_success_response("Login successful", response))
}

/// Регистрация нового пользователя
pub async fn register(
    register_req: web::Json<RegisterRequest>,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let pool = db.get_pool();
    
    // Проверяем, что пользователь не существует
    match User::find_by_username(&register_req.username, pool).await {
        Ok(Some(_)) => return Ok(create_bad_request_response("Username already exists")),
        Err(e) => {
            error!("Database error during registration check: {}", e);
            return Ok(create_error_response("Database error"));
        },
        _ => {}
    }
    
    // Создаем нового пользователя с хэшированным паролем
    let user = match User::new(
        register_req.username.clone(),
        register_req.password.clone(),
        Some(register_req.email.clone())
    ) {
        Ok(user) => user,
        Err(e) => return Ok(create_bad_request_response(&e)),
    };
    
    // Сохраняем в базу данных
    match user.create(pool).await {
        Ok(_) => Ok(create_success_response("User registered successfully", user)),
        Err(e) => {
            error!("Failed to create user: {}", e);
            Ok(create_error_response("Failed to create user"))
        }
    }
}

/// Получение профиля текущего пользователя
pub async fn user_profile(
    req: HttpRequest,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let user = check_auth(&req, &db).await;
    
    match user {
        Some(user) => {
            Ok(HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: None,
                data: Some(user),
            }))
        },
        None => Ok(create_unauthorized_response())
    }
}
