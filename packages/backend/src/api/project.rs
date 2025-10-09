use actix_web::{web, HttpResponse, HttpRequest, Result};
use crate::core::database::Database;
use crate::domain::project::{Project, ProjectConfig};
use crate::domain::repository::Repository;
use crate::domain::user::User;
use log::error;
use serde::{Serialize, Deserialize};
use super::user::{self, ApiResponse};

// ============================================================================
// СТРУКТУРЫ ЗАПРОСОВ И ОТВЕТОВ
// ============================================================================

#[derive(Serialize, Deserialize)]
pub struct CreateProjectRequest {
    pub name: String,
    pub description: Option<String>,
    pub is_public: bool,
}

#[derive(Serialize, Deserialize)]
pub struct CreateRepoInProjectRequest {
    pub name: String,
    pub description: Option<String>,
    pub is_public: bool,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateProjectConfigRequest {
    pub config: ProjectConfig,
}

#[derive(Serialize)]
pub struct ProjectWithRepos {
    pub project: Project,
    pub repositories: Vec<Repository>,
    pub config: ProjectConfig,
}

#[derive(Serialize)]
pub struct ProjectDetails {
    pub project: Project,
    pub repositories: Vec<Repository>,
    pub config: ProjectConfig,
    pub owner: User,
}

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

fn check_auth_or_unauthorized(req: &HttpRequest, db: &Database) -> Option<User> {
    user::check_auth(req, db)
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

fn create_not_found_response(message: &str) -> HttpResponse {
    HttpResponse::NotFound().json(ApiResponse::<()> {
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

fn create_forbidden_response(message: &str) -> HttpResponse {
    HttpResponse::Forbidden().json(ApiResponse::<()> {
        success: false,
        message: Some(message.to_string()),
        data: None,
    })
}

// ============================================================================
// API HANDLERS
// ============================================================================

/// Получение списка проектов пользователя
pub async fn list_projects(req: HttpRequest, db: web::Data<Database>) -> Result<HttpResponse> {
    let user = check_auth_or_unauthorized(&req, &db);
    if user.is_none() {
        return Ok(create_unauthorized_response());
    }
    let user = user.unwrap();
    
    let pool = db.get_pool();
    let projects_result = Project::find_by_owner(user.id.unwrap(), pool).await;
    
    match projects_result {
        Ok(projects) => {
            Ok(HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: None,
                data: Some(projects),
            }))
        },
        Err(e) => {
            error!("Failed to fetch projects: {}", e);
            Ok(create_error_response("Failed to fetch projects"))
        }
    }
}

/// Получение списка всех публичных проектов
pub async fn list_public_projects(_req: HttpRequest, db: web::Data<Database>) -> Result<HttpResponse> {
    let pool = db.get_pool();
    let projects_result = Project::find_public(conn).await;
    
    match projects_result {
        Ok(projects) => {
            Ok(HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: None,
                data: Some(projects),
            }))
        },
        Err(e) => {
            error!("Failed to fetch public projects: {}", e);
            Ok(create_error_response("Failed to fetch public projects"))
        }
    }
}

/// Создание нового проекта
pub async fn create_project(
    req: HttpRequest,
    project_req: web::Json<CreateProjectRequest>,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let user = check_auth_or_unauthorized(&req, &db);
    if user.is_none() {
        return Ok(create_unauthorized_response());
    }
    let user = user.unwrap();
    
    let pool = db.get_pool();
    
    // Проверяем существование проекта
    let existing_project = Project::find_by_name_and_owner(&project_req.name, user.id.unwrap(), pool).await;
    match existing_project {
        Ok(Some(_)) => {
            return Ok(create_bad_request_response("Project with this name already exists"));
        },
        Err(e) => {
            error!("Database error: {}", e);
            return Ok(create_error_response("Database error"));
        },
        _ => {}
    }
    
    // Создаем проект
    let project = Project {
        id: None,
        name: project_req.name.clone(),
        owner_id: user.id.unwrap(),
        description: project_req.description.clone(),
        is_public: project_req.is_public,
        created_at: None,
    };
    
    let create_result = project.create(conn).await;
    match create_result {
        Ok(_) => {
            Ok(HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: Some("Project created successfully".to_string()),
                data: Some(project),
            }))
        },
        Err(e) => {
            error!("Failed to create project: {}", e);
            Ok(create_error_response("Failed to create project"))
        }
    }
}

/// Получение информации о проекте
pub async fn get_project(
    req: HttpRequest,
    path: web::Path<(String, String)>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let (username, project_name) = path.into_inner();
    let pool = db.get_pool();

    // Находим владельца
    let owner_result = User::find_by_username(&username, pool.clone());
    let owner = match owner_result {
        Ok(Some(user)) => user,
        Ok(None) => return Ok(create_not_found_response("User not found")),
        Err(e) => {
            error!("Database error: {}", e);
            return Ok(create_error_response("Database error"));
        }
    };

    // Находим проект
    let project_result = Project::find_by_name_and_owner(&project_name, owner.id.unwrap(), pool).await;
    let project = match project_result {
        Ok(Some(project)) => project,
        Ok(None) => return Ok(create_not_found_response("Project not found")),
        Err(e) => {
            error!("Database error: {}", e);
            return Ok(create_error_response("Database error"));
        }
    };

    // Проверяем права доступа
    let current_user = user::check_auth(&req, &db);
    let can_access = project.is_public || 
        current_user.as_ref().map(|u| u.id.unwrap()) == Some(project.owner_id);

    if !can_access {
        return Ok(create_forbidden_response("Access denied"));
    }

    // Получаем репозитории и конфигурацию
    let repositories = Repository::find_by_project(project.id.unwrap(), pool).await.unwrap_or_else(|_| Vec::new());
    let config = project.get_config(conn.clone()).unwrap_or_default().await;

    let project_details = ProjectDetails {
        project,
        repositories,
        config,
        owner,
    };

    Ok(HttpResponse::Ok().json(ApiResponse {
        success: true,
        message: None,
        data: Some(project_details),
    }))
}

/// Создание репозитория в проекте
pub async fn create_repo_in_project(
    req: HttpRequest,
    path: web::Path<(String, String)>,
    repo_req: web::Json<CreateRepoInProjectRequest>,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let (username, project_name) = path.into_inner();
    
    let user = check_auth_or_unauthorized(&req, &db);
    if user.is_none() {
        return Ok(create_unauthorized_response());
    }
    let user = user.unwrap();
    
    let pool = db.get_pool();

    // Находим владельца проекта
    let owner_result = User::find_by_username(&username, pool.clone());
    let owner = match owner_result {
        Ok(Some(user)) => user,
        Ok(None) => return Ok(create_not_found_response("User not found")),
        Err(e) => {
            error!("Database error: {}", e);
            return Ok(create_error_response("Database error"));
        }
    };

    // Находим проект
    let project_result = Project::find_by_name_and_owner(&project_name, owner.id.unwrap(), pool).await;
    let project = match project_result {
        Ok(Some(project)) => project,
        Ok(None) => return Ok(create_not_found_response("Project not found")),
        Err(e) => {
            error!("Database error: {}", e);
            return Ok(create_error_response("Database error"));
        }
    };

    // Проверяем права доступа
    if user.id.unwrap() != project.owner_id {
        return Ok(create_forbidden_response("Only project owner can create repositories"));
    }

    // Проверяем существование репозитория
    let existing_repo = Repository::find_by_name_and_project(&repo_req.name, project.id.unwrap(), pool).await;
    match existing_repo {
        Ok(Some(_)) => {
            return Ok(create_bad_request_response("Repository with this name already exists in project"));
        },
        Err(e) => {
            error!("Database error: {}", e);
            return Ok(create_error_response("Database error"));
        },
        _ => {}
    }

    // Создаем репозиторий
    let repo = Repository {
        id: None,
        name: repo_req.name.clone(),
        project_id: project.id.unwrap(),
        owner_id: user.id.unwrap(),
        description: repo_req.description.clone(),
        is_public: repo_req.is_public,
        created_at: None,
    };
    
    let create_result = repo.create(conn);
    match create_result {
        Ok(_) => {
            Ok(HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: Some("Repository created successfully".to_string()),
                data: Some(repo),
            }))
        },
        Err(e) => {
            error!("Failed to create repository: {}", e);
            Ok(create_error_response("Failed to create repository"))
        }
    }
}

/// Обновление конфигурации проекта
pub async fn update_project_config(
    req: HttpRequest,
    path: web::Path<(String, String)>,
    config_req: web::Json<UpdateProjectConfigRequest>,
    db: web::Data<Database>
) -> Result<HttpResponse> {
    let (username, project_name) = path.into_inner();
    
    let user = check_auth_or_unauthorized(&req, &db);
    if user.is_none() {
        return Ok(create_unauthorized_response());
    }
    let user = user.unwrap();
    
    let pool = db.get_pool();

    // Находим владельца проекта
    let owner_result = User::find_by_username(&username, pool.clone());
    let owner = match owner_result {
        Ok(Some(user)) => user,
        Ok(None) => return Ok(create_not_found_response("User not found")),
        Err(e) => {
            error!("Database error: {}", e);
            return Ok(create_error_response("Database error"));
        }
    };

    // Находим проект
    let project_result = Project::find_by_name_and_owner(&project_name, owner.id.unwrap(), pool).await;
    let project = match project_result {
        Ok(Some(project)) => project,
        Ok(None) => return Ok(create_not_found_response("Project not found")),
        Err(e) => {
            error!("Database error: {}", e);
            return Ok(create_error_response("Database error"));
        }
    };

    // Проверяем права доступа
    if user.id.unwrap() != project.owner_id {
        return Ok(create_forbidden_response("Only project owner can update configuration"));
    }

    // Сохраняем конфигурацию
    let update_result = project.update_config(&config_req.config, db.get_pool()).await;
    match update_result {
        Ok(_) => {
            Ok(HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: Some("Project configuration updated successfully".to_string()),
                data: Some(&config_req.config),
            }))
        },
        Err(e) => {
            error!("Failed to save project configuration: {}", e);
            Ok(create_error_response("Failed to save project configuration"))
        }
    }
}

/// Получение конфигурации проекта
pub async fn get_project_config(
    req: HttpRequest,
    path: web::Path<(String, String)>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let (username, project_name) = path.into_inner();
    let pool = db.get_pool();

    // Находим владельца
    let owner_result = User::find_by_username(&username, pool.clone());
    let owner = match owner_result {
        Ok(Some(user)) => user,
        Ok(None) => return Ok(create_not_found_response("User not found")),
        Err(e) => {
            error!("Database error: {}", e);
            return Ok(create_error_response("Database error"));
        }
    };

    // Находим проект
    let project_result = Project::find_by_name_and_owner(&project_name, owner.id.unwrap(), pool).await;
    let project = match project_result {
        Ok(Some(project)) => project,
        Ok(None) => return Ok(create_not_found_response("Project not found")),
        Err(e) => {
            error!("Database error: {}", e);
            return Ok(create_error_response("Database error"));
        }
    };

    // Проверяем права доступа
    let current_user = user::check_auth(&req, &db);
    let can_access = project.is_public || 
        current_user.as_ref().map(|u| u.id.unwrap()) == Some(project.owner_id);

    if !can_access {
        return Ok(create_forbidden_response("Access denied"));
    }

    // Загружаем конфигурацию
    let config = project.get_config(db.get_pool()).unwrap_or_default().await;

    Ok(HttpResponse::Ok().json(ApiResponse {
        success: true,
        message: None,
        data: Some(config),
    }))
}
