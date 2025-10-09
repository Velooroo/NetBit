use actix_web::{web, HttpResponse, HttpRequest, Result};
use crate::core::database::Database;
use crate::domain::repository::Repository;
use log::{error};
use serde::{Serialize, Deserialize};
use std::process::Command;
use super::user::{self, ApiResponse};
use super::project::CreateRepoInProjectRequest;
use crate::utils::git;

// Структура для автоматического парсинга query-параметров
#[derive(Debug, Deserialize)]
pub struct RepoQuery {
    branch: Option<String>,  // Опциональный параметр
}

#[derive(Debug, Serialize)]
struct GitFile {
    name: String,
    #[serde(rename = "type")]
    type_: String,  // "blob" (файл), "tree" (директория)
    last_branch: String,// кеш вид ветки
    size: Option<u64>,  // Размер файла (если есть)
}

/// Получение списка репозиториев
pub async fn list_repos(
    req: HttpRequest, 
    db: web::Data<Database>
) -> Result<HttpResponse> {
    if let Some(user) = user::check_auth(&req, &db) {
        let pool = db.get_pool();
        match Repository::find_by_owner(user.id.unwrap(), pool) {
            Ok(repos) => {
                Ok(HttpResponse::Ok().json(ApiResponse {
                    success: true,
                    message: None,
                    data: Some(repos),
                }))
            },
            Err(e) => {
                error!("Failed to fetch repositories: {}", e);
                Ok(HttpResponse::InternalServerError().json(ApiResponse::<()> {
                    success: false,
                    message: Some("Failed to fetch repositories".to_string()),
                    data: None,
                }))
            }
        }
    } else {
        Ok(HttpResponse::Unauthorized().json(ApiResponse::<()> {
            success: false,
            message: Some("Unauthorized".to_string()),
            data: None,
        }))
    }
}

/// Создание нового репозитория (устаревший метод - теперь репозитории создаются через проекты)
pub async fn create_repo(
    _req: HttpRequest,
    _repo_req: web::Json<CreateRepoInProjectRequest>,
    _db: web::Data<Database>
) -> Result<HttpResponse> {
    Ok(HttpResponse::BadRequest().json(ApiResponse::<()> {
        success: false,
        message: Some("Direct repository creation is deprecated. Please create repositories within projects.".to_string()),
        data: None,
    }))
}

// pub async fn get_files_in_repo(
//     _req: HttpRequest,
//     path: web::Path<String>,
//     db: web::Data<Database>
// ) -> Result<HttpResponse> {
//     let repo_name = path.into_inner();
//     let pool = db.get_pool();

//     match Repository::match Repository::find_by_name(&repo_name, pool).await {
//         Ok(Some(repo)) => {
//             let repo_path = format!()
//         }
//     }
// }

/// Получение информации о репозитории
pub async fn get_repo(
    _req: HttpRequest,
    path: web::Path<String>,
    query: web::Query<RepoQuery>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let repo_name = path.into_inner();
    let branch = query.branch.as_deref().unwrap_or("main");
    let pool = db.get_pool();

    match Repository::find_by_name(&repo_name, pool).await {
        Ok(Some(repo)) => {
            // Получаем ветки репозитория
            let repo_path = format!("repositories/{}.git/", repo_name);
            
            let branches_output = Command::new("git")
                .args(&["--git-dir", &repo_path, "branch", "--format=%(refname:short)"])
                .output();

            let files_output = Command::new("git")
                .args(&["--git-dir", &repo_path, "ls-tree", "-l", branch])
                .output();

            let branches = match branches_output {
                Ok(output) if output.status.success() => {
                    let stdout = String::from_utf8_lossy(&output.stdout);
                    stdout.lines().map(|s| s.to_string()).collect::<Vec<String>>()
                },
                _ => Vec::new(),
            };

            let files = match files_output {
            Ok(output) if output.status.success() => {
                let stdout = String::from_utf8_lossy(&output.stdout);
                stdout.lines()
                    .filter_map(|line| {
                        let mut parts = line.split_whitespace();
                        let _mode = parts.next()?;
                        let type_ = parts.next()?.to_string();
                        let branch = parts.next()?.to_string();
                        let size = parts.next()?.parse().ok();
                        let name = parts.collect::<Vec<&str>>().join(" ");
                    
                        Some(GitFile {
                            name,
                            type_: type_.clone(),
                            last_branch: branch,
                            size: if type_ == "blob" { size } else { None },
                        })
                    })
                    .collect()
            },
            _ => Vec::new(),
        };
            #[derive(Serialize)]
            struct RepoDetails {
                repo: Repository,
                branches: Vec<String>,
                files: Vec<GitFile>,
            }
            
            Ok(HttpResponse::Ok().json(ApiResponse {
                success: true,
                message: None,
                data: Some(RepoDetails {
                    repo,
                    branches,
                    files,
                }),
            }))
        },
        Ok(None) => {
            Ok(HttpResponse::NotFound().json(ApiResponse::<()> {
                success: false,
                message: Some("Repository not found".to_string()),
                data: None,
            }))
        },
        Err(e) => {
            error!("Database error: {}", e);
            Ok(HttpResponse::InternalServerError().json(ApiResponse::<()> {
                success: false,
                message: Some("Database error".to_string()),
                data: None,
            }))
        }
    }
}

/// Get repository in project context (new project-based route)
pub async fn get_repo_in_project(
    req: HttpRequest,
    path: web::Path<(String, String, String)>,
    query: web::Query<RepoQuery>,
    db: web::Data<Database>,
) -> Result<HttpResponse> {
    let (username, project_name, repo_name) = path.into_inner();
    
    // For now, delegate to the existing get_repo function
    // In the future, this could include project-specific logic
    let repo_path = web::Path::from(repo_name);
    get_repo(req, repo_path, query, db).await
}

/// Get repository contents (project-based route)
pub async fn get_repo_contents(
    _req: HttpRequest,
    _path: web::Path<(String, String, String)>,
    _db: web::Data<Database>,
) -> Result<HttpResponse> {
    // Placeholder implementation
    Ok(HttpResponse::Ok().json(ApiResponse::<Vec<String>> {
        success: true,
        message: None,
        data: Some(vec![]),
    }))
}

/// Get repository commits (project-based route)
pub async fn get_repo_commits(
    _req: HttpRequest,
    _path: web::Path<(String, String, String)>,
    _db: web::Data<Database>,
) -> Result<HttpResponse> {
    // Placeholder implementation
    Ok(HttpResponse::Ok().json(ApiResponse::<Vec<String>> {
        success: true,
        message: None,
        data: Some(vec![]),
    }))
}

/// Get repository branches (project-based route)
pub async fn get_repo_branches(
    _req: HttpRequest,
    _path: web::Path<(String, String, String)>,
    _db: web::Data<Database>,
) -> Result<HttpResponse> {
    // Placeholder implementation
    Ok(HttpResponse::Ok().json(ApiResponse::<Vec<String>> {
        success: true,
        message: None,
        data: Some(vec!["main".to_string()]),
    }))
}

/// Get repository README (project-based route)
pub async fn get_repo_readme(
    _req: HttpRequest,
    _path: web::Path<(String, String, String)>,
    _db: web::Data<Database>,
) -> Result<HttpResponse> {
    // Placeholder implementation
    Ok(HttpResponse::Ok().json(ApiResponse::<String> {
        success: true,
        message: None,
        data: Some("# Repository README\n\nThis is a placeholder README file.".to_string()),
    }))
}
