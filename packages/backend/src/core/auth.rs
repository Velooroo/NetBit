//! Ядро системы - аутентификация и авторизация

use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use chrono::{Duration, Utc};
use actix_web::HttpRequest;
use crate::domain::user::User;
use crate::core::database::Database;
use log::error;

// ============================================================================
// СТРУКТУРЫ И КОНСТАНТЫ
// ============================================================================

/// JWT Claims структура
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    /// ID пользователя
    pub user_id: i64,
    /// Имя пользователя
    pub username: String,
    /// Email пользователя
    pub email: Option<String>,
    /// Время истечения токена (timestamp)
    pub exp: i64,
    /// Время выдачи токена (timestamp)
    pub iat: i64,
}

/// Структура для ответа с токеном
#[derive(Serialize)]
pub struct TokenResponse {
    pub token: String,
    pub expires_in: i64,
    pub user: User,
}

/// Секретный ключ для подписи JWT (в продакшене должен быть в переменных окружения)
const JWT_SECRET: &str = "your-secret-key-change-in-production";

// ============================================================================
// РЕАЛИЗАЦИЯ CLAIMS
// ============================================================================

impl Claims {
    /// Создает новые claims для пользователя
    pub fn new(user: &User) -> Self {
        let now = Utc::now();
        let exp = now + Duration::hours(24); // Токен действует 24 часа
        
        Self {
            user_id: user.id.unwrap(),
            username: user.username.clone(),
            email: user.email.clone(),
            exp: exp.timestamp(),
            iat: now.timestamp(),
        }
    }

    /// Генерирует JWT токен
    pub fn to_token(&self) -> Result<String, jsonwebtoken::errors::Error> {
        let header = Header::new(Algorithm::HS256);
        let encoding_key = EncodingKey::from_secret(JWT_SECRET.as_ref());
        
        encode(&header, self, &encoding_key)
    }

    /// Декодирует JWT токен
    pub fn from_token(token: &str) -> Result<Self, jsonwebtoken::errors::Error> {
        let decoding_key = DecodingKey::from_secret(JWT_SECRET.as_ref());
        let validation = Validation::new(Algorithm::HS256);
        
        let token_data = decode::<Claims>(token, &decoding_key, &validation)?;
        Ok(token_data.claims)
    }
}

// ============================================================================
// ПУБЛИЧНЫЕ ФУНКЦИИ
// ============================================================================

/// Извлекает токен из заголовка Authorization
pub fn extract_token_from_header(req: &HttpRequest) -> Option<String> {
    let auth_header = req.headers().get("Authorization")?;
    let auth_str = auth_header.to_str().ok()?;
    
    if auth_str.starts_with("Bearer ") {
        Some(auth_str.trim_start_matches("Bearer ").to_string())
    } else {
        None
    }
}

/// Проверяет JWT токен и возвращает пользователя
pub async fn verify_jwt_token(req: &HttpRequest, db: &Database) -> Option<User> {
    let token = extract_token_from_header(req)?;
    
    match Claims::from_token(&token) {
        Ok(claims) => {
            // Проверяем, что токен не истек
            let now = Utc::now().timestamp();
            if claims.exp < now {
                return None;
            }
            
            // Получаем пользователя из базы данных
            let pool = db.get_pool();
            match User::find_by_id(claims.user_id, pool).await {
                Ok(Some(user)) => Some(user),
                _ => None
            }
        },
        Err(e) => {
            error!("JWT token verification failed: {}", e);
            None
        }
    }
}

/// Генерирует JWT токен для пользователя
pub fn generate_token_for_user(user: &User) -> Result<TokenResponse, String> {
    let claims = Claims::new(user);
    
    match claims.to_token() {
        Ok(token) => {
            Ok(TokenResponse {
                token,
                expires_in: 24 * 60 * 60, // 24 часа в секундах
                user: user.clone(),
            })
        },
        Err(e) => {
            error!("Failed to generate JWT token: {}", e);
            Err("Failed to generate token".to_string())
        }
    }
}

/// Проверка аутентификации пользователя (JWT или Basic Auth)
pub async fn check_auth(req: &HttpRequest, db: &Database) -> Option<User> {
    // Сначала пробуем JWT токен
    if let Some(user) = verify_jwt_token(req, db).await {
        return Some(user);
    }
    
    // Если JWT не найден, пробуем Basic Auth для обратной совместимости
    check_basic_auth(req, db).await
}

/// Поддержка Basic Auth для Git операций
pub async fn check_basic_auth(req: &HttpRequest, db: &Database) -> Option<User> {
    use base64::{Engine as _, engine::general_purpose};
    
    let auth_header = req.headers().get("Authorization")?;
    let auth_str = auth_header.to_str().ok()?;
    
    if !auth_str.starts_with("Basic ") {
        return None;
    }

    let credentials = general_purpose::STANDARD.decode(auth_str.trim_start_matches("Basic ")).ok()?;
    let credentials_str = String::from_utf8(credentials).ok()?;
    
    let mut parts = credentials_str.splitn(2, ':');
    let username = parts.next()?;
    let password = parts.next()?;

    let pool = db.get_pool();
    match User::authenticate(username, password, pool).await {
        Ok(Some(user)) => Some(user),
        _ => None
    }
}
