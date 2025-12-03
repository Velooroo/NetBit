//! Ядро системы - основные типы данных и структуры

use serde::{Deserialize, Serialize};

// ============================================================================
// ОБЩИЕ ТИПЫ ОТВЕТОВ API
// ============================================================================

/// Стандартная структура ответа API
#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: Option<String>,
    pub data: Option<T>,
}

/// Структура для пагинации
#[derive(Serialize, Deserialize)]
pub struct Pagination {
    pub page: u32,
    pub per_page: u32,
    pub total: u32,
    pub total_pages: u32,
}

/// Структура для сортировки
#[derive(Serialize, Deserialize)]
pub struct Sort {
    pub field: String,
    pub direction: SortDirection,
}

#[derive(Serialize, Deserialize)]
pub enum SortDirection {
    Asc,
    Desc,
}

// ============================================================================
// ТИПЫ ДЛЯ КОНФИГУРАЦИИ
// ============================================================================

/// Конфигурация сервера
#[derive(Debug, Clone)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub database_url: String,
    pub jwt_secret: String,
    pub repositories_path: String,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            host: "127.0.0.1".to_string(),
            port: 8000,
            database_url: "gitea.db".to_string(),
            jwt_secret: "your-secret-key-change-in-production".to_string(),
            repositories_path: "repositories".to_string(),
        }
    }
}

// ============================================================================
// ТИПЫ ДЛЯ ОШИБОК
// ============================================================================

/// Типы ошибок в системе
#[derive(Debug, Serialize)]
pub enum ErrorType {
    DatabaseError,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    NotFoundError,
    ConflictError,
    InternalError,
}

/// Структура ошибки
#[derive(Debug, Serialize)]
pub struct AppError {
    pub error_type: ErrorType,
    pub message: String,
    pub details: Option<String>,
}

impl AppError {
    pub fn new(error_type: ErrorType, message: &str) -> Self {
        Self {
            error_type,
            message: message.to_string(),
            details: None,
        }
    }

    pub fn with_details(error_type: ErrorType, message: &str, details: &str) -> Self {
        Self {
            error_type,
            message: message.to_string(),
            details: Some(details.to_string()),
        }
    }
}

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

/// Создает успешный ответ API
pub fn success_response<T: Serialize>(data: T) -> ApiResponse<T> {
    ApiResponse {
        success: true,
        message: None,
        data: Some(data),
    }
}

/// Создает успешный ответ API с сообщением
pub fn success_response_with_message<T: Serialize>(message: &str, data: T) -> ApiResponse<T> {
    ApiResponse {
        success: true,
        message: Some(message.to_string()),
        data: Some(data),
    }
}

/// Создает ответ об ошибке
pub fn error_response(message: &str) -> ApiResponse<()> {
    ApiResponse {
        success: false,
        message: Some(message.to_string()),
        data: None,
    }
}

/// Создает ответ об ошибке с деталями
pub fn error_response_with_details(message: &str, error: &AppError) -> ApiResponse<AppError> {
    ApiResponse {
        success: false,
        message: Some(message.to_string()),
        data: Some(error.clone()),
    }
}

impl Clone for AppError {
    fn clone(&self) -> Self {
        Self {
            error_type: match self.error_type {
                ErrorType::DatabaseError => ErrorType::DatabaseError,
                ErrorType::AuthenticationError => ErrorType::AuthenticationError,
                ErrorType::AuthorizationError => ErrorType::AuthorizationError,
                ErrorType::ValidationError => ErrorType::ValidationError,
                ErrorType::NotFoundError => ErrorType::NotFoundError,
                ErrorType::ConflictError => ErrorType::ConflictError,
                ErrorType::InternalError => ErrorType::InternalError,
            },
            message: self.message.clone(),
            details: self.details.clone(),
        }
    }
}
