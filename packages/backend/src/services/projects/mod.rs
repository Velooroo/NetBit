//! Сервисный слой для операций с проектами

use crate::core::database::Database;
use crate::domain::{
    projects::{Project, ProjectConfig},
    repos::Repository,
    users::User,
};

/// Возвращает проекты по владельцу
pub async fn list_by_owner(owner_id: i64, db: &Database) -> Result<Vec<Project>, sqlx::Error> {
    Project::find_by_owner(owner_id, db.get_pool()).await
}

/// Возвращает публичные проекты
pub async fn list_public(db: &Database) -> Result<Vec<Project>, sqlx::Error> {
    Project::find_public(db.get_pool()).await
}

/// Создаёт новый проект
pub async fn create(project: Project, db: &Database) -> Result<(), sqlx::Error> {
    project.create(db.get_pool()).await.map(|_| ())
}

/// Находит пользователя по имени
pub async fn find_owner(username: &str, db: &Database) -> Result<Option<User>, sqlx::Error> {
    User::find_by_username(username, db.get_pool()).await
}

/// Находит проект по имени и владельцу
pub async fn find_project(
    name: &str,
    owner_id: i64,
    db: &Database,
) -> Result<Option<Project>, sqlx::Error> {
    Project::find_by_name_and_owner(name, owner_id, db.get_pool()).await
}

/// Возвращает репозитории проекта
pub async fn repositories(project_id: i64, db: &Database) -> Result<Vec<Repository>, sqlx::Error> {
    Repository::find_by_project(project_id, db.get_pool()).await
}

/// Возвращает конфигурацию проекта
pub async fn config(project: &Project, db: &Database) -> Result<ProjectConfig, sqlx::Error> {
    project.get_config(db.get_pool()).await
}

/// Обновляет конфигурацию проекта
pub async fn update_config(
    project: &Project,
    config: &ProjectConfig,
    db: &Database,
) -> Result<(), sqlx::Error> {
    project.update_config(config, db.get_pool()).await
}
