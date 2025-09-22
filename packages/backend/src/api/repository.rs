//! API для работы с репозиториями

use actix_web::{web, HttpResponse, Result, HttpRequest};
use crate::domain::repository::Repository;
use crate::domain::user::User;
use crate::core::types::{ApiResponse, ApiError};
use crate::core::database::get_db_connection;
use serde::{Deserialize, Serialize};
use log::{info, error};

// ============================================================================
// СТРУКТУРЫ ЗАПРОСОВ И ОТВЕТОВ
// ============================================================================

#[derive(Deserialize)]
pub struct CreateRepositoryRequest {
    pub name: String,
    pub description: Option<String>,
    pub project_id: i64,
    pub is_public: bool,
}

#[derive(Serialize)]
pub struct RepositoryResponse {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub project_id: i64,
    pub owner_id: i64,
    pub is_public: bool,
    pub created_at: String,
    pub owner: UserInfo,
    pub stats: RepositoryStats,
}

#[derive(Serialize)]
pub struct UserInfo {
    pub username: String,
    pub full_name: Option<String>,
}

#[derive(Serialize)]
pub struct RepositoryStats {
    pub stars: i32,
    pub forks: i32,
    pub commits: i32,
}

// ============================================================================
// ОБРАБОТЧИКИ API
// ============================================================================

/// Получить список репозиториев пользователя
pub async fn get_user_repositories(req: HttpRequest) -> Result<HttpResponse> {
    info!("Getting user repositories");
    
    // Извлекаем пользователя из токена (это будет реализовано в middleware)
    let user_id = extract_user_id_from_token(&req)?;
    
    let db = get_db_connection();
    
    match Repository::find_by_owner(user_id, db) {
        Ok(repositories) => {
            let response_repos: Vec<RepositoryResponse> = repositories
                .into_iter()
                .map(|repo| {
                    // Получаем информацию о владельце
                    let owner = User::find_by_id(repo.owner_id, get_db_connection())
                        .unwrap_or_else(|_| User {
                            id: Some(repo.owner_id),
                            username: "unknown".to_string(),
                            password_hash: "".to_string(),
                            email: None,
                            full_name: None,
                            avatar: None,
                            bio: None,
                            is_active: true,
                            created_at: None,
                            updated_at: None,
                        });
                    
                    RepositoryResponse {
                        id: repo.id.unwrap_or(0),
                        name: repo.name,
                        description: repo.description,
                        project_id: repo.project_id,
                        owner_id: repo.owner_id,
                        is_public: repo.is_public,
                        created_at: repo.created_at.unwrap_or_else(|| chrono::Utc::now().to_rfc3339()),
                        owner: UserInfo {
                            username: owner.username,
                            full_name: owner.full_name,
                        },
                        stats: RepositoryStats {
                            stars: rand::random::<u8>() as i32,
                            forks: rand::random::<u8>() as i32 / 2,
                            commits: rand::random::<u8>() as i32,
                        },
                    }
                })
                .collect();
            
            Ok(HttpResponse::Ok().json(ApiResponse::success(response_repos)))
        }
        Err(e) => {
            error!("Failed to get repositories: {}", e);
            Ok(HttpResponse::InternalServerError().json(
                ApiResponse::<()>::error("Failed to get repositories")
            ))
        }
    }
}

/// Создать новый репозиторий
pub async fn create_repository(
    req: HttpRequest,
    repo_data: web::Json<CreateRepositoryRequest>,
) -> Result<HttpResponse> {
    info!("Creating new repository: {}", repo_data.name);
    
    let user_id = extract_user_id_from_token(&req)?;
    
    // Валидация данных
    if let Err(validation_error) = validate_repository_data(&repo_data) {
        return Ok(HttpResponse::BadRequest().json(
            ApiResponse::<()>::error(&validation_error)
        ));
    }
    
    let db = get_db_connection();
    
    // Проверяем, не существует ли уже репозиторий с таким именем
    match Repository::find_by_name(&repo_data.name, db.clone()) {
        Ok(Some(_)) => {
            return Ok(HttpResponse::Conflict().json(
                ApiResponse::<()>::error("Repository with this name already exists")
            ));
        }
        Ok(None) => {
            // Продолжаем создание
        }
        Err(e) => {
            error!("Error checking repository existence: {}", e);
            return Ok(HttpResponse::InternalServerError().json(
                ApiResponse::<()>::error("Internal server error")
            ));
        }
    }
    
    // Создаем новый репозиторий
    match Repository::new(
        repo_data.name.clone(),
        repo_data.project_id,
        user_id,
        repo_data.description.clone(),
        repo_data.is_public,
    ) {
        Ok(repository) => {
            match repository.create(db) {
                Ok(repo_id) => {
                    info!("Repository created with ID: {}", repo_id);
                    
                    let response = RepositoryResponse {
                        id: repo_id,
                        name: repository.name,
                        description: repository.description,
                        project_id: repository.project_id,
                        owner_id: repository.owner_id,
                        is_public: repository.is_public,
                        created_at: chrono::Utc::now().to_rfc3339(),
                        owner: UserInfo {
                            username: "current_user".to_string(), // Будет заменено на реального пользователя
                            full_name: None,
                        },
                        stats: RepositoryStats {
                            stars: 0,
                            forks: 0,
                            commits: 0,
                        },
                    };
                    
                    Ok(HttpResponse::Created().json(ApiResponse::success(response)))
                }
                Err(e) => {
                    error!("Failed to create repository: {}", e);
                    Ok(HttpResponse::InternalServerError().json(
                        ApiResponse::<()>::error("Failed to create repository")
                    ))
                }
            }
        }
        Err(validation_error) => {
            Ok(HttpResponse::BadRequest().json(
                ApiResponse::<()>::error(&validation_error)
            ))
        }
    }
}

/// Получить информацию о конкретном репозитории
pub async fn get_repository(
    req: HttpRequest,
    path: web::Path<String>,
) -> Result<HttpResponse> {
    let repo_name = path.into_inner();
    info!("Getting repository: {}", repo_name);
    
    let db = get_db_connection();
    
    match Repository::find_by_name(&repo_name, db) {
        Ok(Some(repository)) => {
            // Получаем информацию о владельце
            let owner = User::find_by_id(repository.owner_id, get_db_connection())
                .unwrap_or_else(|_| User {
                    id: Some(repository.owner_id),
                    username: "unknown".to_string(),
                    password_hash: "".to_string(),
                    email: None,
                    full_name: None,
                    avatar: None,
                    bio: None,
                    is_active: true,
                    created_at: None,
                    updated_at: None,
                });
            
            let response = RepositoryResponse {
                id: repository.id.unwrap_or(0),
                name: repository.name,
                description: repository.description,
                project_id: repository.project_id,
                owner_id: repository.owner_id,
                is_public: repository.is_public,
                created_at: repository.created_at.unwrap_or_else(|| chrono::Utc::now().to_rfc3339()),
                owner: UserInfo {
                    username: owner.username,
                    full_name: owner.full_name,
                },
                stats: RepositoryStats {
                    stars: rand::random::<u8>() as i32,
                    forks: rand::random::<u8>() as i32 / 2,
                    commits: rand::random::<u8>() as i32,
                },
            };
            
            Ok(HttpResponse::Ok().json(ApiResponse::success(response)))
        }
        Ok(None) => {
            Ok(HttpResponse::NotFound().json(
                ApiResponse::<()>::error("Repository not found")
            ))
        }
        Err(e) => {
            error!("Failed to get repository: {}", e);
            Ok(HttpResponse::InternalServerError().json(
                ApiResponse::<()>::error("Internal server error")
            ))
        }
    }
}

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

/// Извлекает ID пользователя из JWT токена
fn extract_user_id_from_token(req: &HttpRequest) -> Result<i64> {
    // Пока что возвращаем заглушку
    // В реальном приложении здесь будет извлечение из JWT токена
    if let Some(auth_header) = req.headers().get("Authorization") {
        if let Ok(auth_str) = auth_header.to_str() {
            if auth_str.starts_with("Bearer ") {
                // Здесь должна быть логика валидации JWT токена
                // Пока возвращаем ID = 1
                return Ok(1);
            }
        }
    }
    
    Err(actix_web::error::ErrorUnauthorized("Missing or invalid authorization token"))
}

/// Валидирует данные для создания репозитория
fn validate_repository_data(data: &CreateRepositoryRequest) -> Result<(), String> {
    if data.name.is_empty() {
        return Err("Repository name cannot be empty".to_string());
    }
    
    if data.name.len() < 2 {
        return Err("Repository name must be at least 2 characters long".to_string());
    }
    
    if data.name.len() > 100 {
        return Err("Repository name cannot be longer than 100 characters".to_string());
    }
    
    if !data.name.chars().all(|c| c.is_alphanumeric() || c == '_' || c == '-' || c == '.') {
        return Err("Repository name can only contain letters, numbers, dots, hyphens, and underscores".to_string());
    }
    
    if data.name.starts_with('.') || data.name.ends_with('.') {
        return Err("Repository name cannot start or end with a dot".to_string());
    }
    
    if data.project_id <= 0 {
        return Err("Valid project ID is required".to_string());
    }
    
    Ok(())
}

// ============================================================================
// КОНФИГУРАЦИЯ МАРШРУТОВ
// ============================================================================

pub fn configure_repository_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/repositories")
            .route("", web::get().to(get_user_repositories))
            .route("", web::post().to(create_repository))
            .route("/{name}", web::get().to(get_repository))
    );
}