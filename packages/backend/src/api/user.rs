use actix_web::{web, HttpResponse, HttpRequest, Result};
use crate::core::database::Database;
use crate::domain::user::{User, UserProfile, UserStats, UserRepository};
use crate::core::auth::{Claims, generate_token_for_user};
use crate::core::orm::{Repository, CrudOperations};
use log::{error, info};
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
    pub email: Option<String>,
    pub password: String,
    pub full_name: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateProfileRequest {
    pub full_name: Option<String>,
    pub bio: Option<String>,
    pub avatar: Option<String>,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: UserProfile,
}

#[derive(Serialize)]
pub struct UserWithStats {
    pub profile: UserProfile,
    pub stats: UserStats,
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

fn create_success_response<T: Serialize>(data: T) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse {
        success: true,
        message: None,
        data: Some(data),
    })
}

fn create_success_message(message: &str) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::<()> {
        success: true,
        message: Some(message.to_string()),
        data: None,
    })
}

// ============================================================================
// ИЗВЛЕЧЕНИЕ ПОЛЬЗОВАТЕЛЯ ИЗ ТОКЕНА
// ============================================================================

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
// API HANDLERS
// ============================================================================

/// Аутентификация пользователя
pub async fn login(
    login_req: web::Json<LoginRequest>,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let user_repo = UserRepository::new(db.get_connection());
    
    // Находим пользователя
    let user = match user_repo.find_by_username(&login_req.username) {
        Ok(Some(user)) => user,
        Ok(None) => return Ok(HttpResponse::BadRequest().json(ApiResponse::<()> {
            success: false,
            message: Some("Invalid username or password".to_string()),
            data: None,
        })),
        Err(e) => {
            error!("Database error during login: {}", e);
            return Ok(create_error_response("Database error"));
        }
    };
    
    // Проверяем пароль
    if !user.verify_password(&login_req.password) {
        return Ok(HttpResponse::BadRequest().json(ApiResponse::<()> {
            success: false,
            message: Some("Invalid username or password".to_string()),
            data: None,
        }));
    }
    
    // Генерируем JWT токен
    let token = match generate_token_for_user(&user) {
        Ok(response) => response.token,
        Err(e) => {
            error!("Failed to generate token: {}", e);
            return Ok(create_error_response("Failed to generate authentication token"));
        }
    };
    
    let response = LoginResponse { 
        token, 
        user: user.to_profile()
    };
    
    Ok(create_success_response(response))
}

/// Регистрация нового пользователя
pub async fn register(
    register_req: web::Json<RegisterRequest>,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let user_repo = UserRepository::new(db.get_connection());
    
    // Проверяем, что пользователь не существует
    if let Ok(Some(_)) = user_repo.find_by_username(&register_req.username) {
        return Ok(HttpResponse::BadRequest().json(ApiResponse::<()> {
            success: false,
            message: Some("Username already exists".to_string()),
            data: None,
        }));
    }
    
    // Проверяем email если указан
    if let Some(ref email) = register_req.email {
        if let Ok(Some(_)) = user_repo.find_by_email(email) {
            return Ok(HttpResponse::BadRequest().json(ApiResponse::<()> {
                success: false,
                message: Some("Email already exists".to_string()),
                data: None,
            }));
        }
    }
    
    // Создаем нового пользователя
    let user = User::new(
        register_req.username.clone(),
        register_req.password.clone(),
        register_req.email.clone(),
    );
    
    // Сохраняем в базу данных
    let created_user = match user_repo.create_user(user) {
        Ok(user) => user,
        Err(e) => {
            error!("Failed to create user: {}", e);
            return Ok(create_error_response("Failed to create user"));
        }
    };
    
    info!("User registered: {}", created_user.username);
    
    Ok(create_success_response(created_user.to_profile()))
}

/// Получение профиля текущего пользователя
pub async fn get_profile(
    req: HttpRequest,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let user_id = match extract_user_from_request(&req) {
        Ok(id) => id,
        Err(response) => return Ok(response),
    };
    
    let user_repo = UserRepository::new(db.get_connection());
    
    let user = match user_repo.find_by_id(user_id) {
        Ok(Some(user)) => user,
        Ok(None) => return Ok(HttpResponse::NotFound().json(ApiResponse::<()> {
            success: false,
            message: Some("User not found".to_string()),
            data: None,
        })),
        Err(e) => {
            error!("Database error: {}", e);
            return Ok(create_error_response("Database error"));
        }
    };
    
    let stats = match user_repo.get_user_stats(user_id) {
        Ok(stats) => stats,
        Err(e) => {
            error!("Failed to get user stats: {}", e);
            return Ok(create_error_response("Failed to get user statistics"));
        }
    };
    
    let response = UserWithStats {
        profile: user.to_profile(),
        stats,
    };
    
    Ok(create_success_response(response))
}

/// Обновление профиля пользователя
pub async fn update_profile(
    req: HttpRequest,
    update_req: web::Json<UpdateProfileRequest>,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let user_id = match extract_user_from_request(&req) {
        Ok(id) => id,
        Err(response) => return Ok(response),
    };
    
    let user_repo = UserRepository::new(db.get_connection());
    
    let mut user = match user_repo.find_by_id(user_id) {
        Ok(Some(user)) => user,
        Ok(None) => return Ok(HttpResponse::NotFound().json(ApiResponse::<()> {
            success: false,
            message: Some("User not found".to_string()),
            data: None,
        })),
        Err(e) => {
            error!("Database error: {}", e);
            return Ok(create_error_response("Database error"));
        }
    };
    
    // Обновляем поля
    if let Some(ref full_name) = update_req.full_name {
        user.full_name = Some(full_name.clone());
    }
    if let Some(ref bio) = update_req.bio {
        user.bio = Some(bio.clone());
    }
    if let Some(ref avatar) = update_req.avatar {
        user.avatar = Some(avatar.clone());
    }
    
    // Сохраняем изменения
    if let Err(e) = user_repo.update_user(&user) {
        error!("Failed to update user: {}", e);
        return Ok(create_error_response("Failed to update profile"));
    }
    
    info!("Profile updated for user: {}", user_id);
    
    Ok(create_success_response(user.to_profile()))
}

/// Получение списка активных пользователей
pub async fn get_users(
    _req: HttpRequest,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let user_repo = UserRepository::new(db.get_connection());
    
    let users = match user_repo.get_active_users() {
        Ok(users) => users,
        Err(e) => {
            error!("Failed to get users: {}", e);
            return Ok(create_error_response("Failed to get users"));
        }
    };
    
    Ok(create_success_response(users))
}

/// Получение профиля пользователя по ID
pub async fn get_user_by_id(
    path: web::Path<i64>,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let user_id = path.into_inner();
    let user_repo = UserRepository::new(db.get_connection());
    
    let user = match user_repo.find_by_id(user_id) {
        Ok(Some(user)) => user,
        Ok(None) => return Ok(HttpResponse::NotFound().json(ApiResponse::<()> {
            success: false,
            message: Some("User not found".to_string()),
            data: None,
        })),
        Err(e) => {
            error!("Database error: {}", e);
            return Ok(create_error_response("Database error"));
        }
    };
    
    let stats = match user_repo.get_user_stats(user_id) {
        Ok(stats) => stats,
        Err(e) => {
            error!("Failed to get user stats: {}", e);
            // Возвращаем профиль без статистики
            return Ok(create_success_response(user.to_profile()));
        }
    };
    
    let response = UserWithStats {
        profile: user.to_profile(),
        stats,
    };
    
    Ok(create_success_response(response))
}
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
    let user = check_auth(&req, &db);
    
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
