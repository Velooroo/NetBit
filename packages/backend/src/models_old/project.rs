use rusqlite::{params, Result};
use std::sync::{Arc, Mutex};
use serde::{Serialize, Deserialize};
use rusqlite::Connection;
use log::{debug, error};

/// Модель проекта
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    /// Идентификатор проекта
    pub id: Option<i64>,
    /// Название проекта
    pub name: String,
    /// Идентификатор владельца проекта
    pub owner_id: i64,
    /// Описание проекта
    pub description: Option<String>,
    /// Флаг публичности проекта
    pub is_public: bool,
    /// Дата создания проекта
    pub created_at: Option<String>,
}

/// Конфигурация проекта (хранится в базе данных как JSON)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectConfig {
    /// Настройки коллаборации
    pub collaboration: CollaborationSettings,
    /// Роли участников
    pub roles: Vec<ProjectRole>,
    /// Настройки видимости
    pub visibility: VisibilitySettings,
    /// Настройки уведомлений
    pub notifications: NotificationSettings,
    /// Дополнительные метаданные
    pub metadata: ProjectMetadata,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CollaborationSettings {
    /// Разрешить форки
    pub allow_forks: bool,
    /// Разрешить issues
    pub allow_issues: bool,
    /// Разрешить pull requests
    pub allow_pull_requests: bool,
    /// Автоматическое слияние
    pub auto_merge: bool,
    /// Требовать ревью
    pub require_review: bool,
    /// Минимальное количество ревьюеров
    pub min_reviewers: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectRole {
    /// ID пользователя
    pub user_id: i64,
    /// Роль пользователя
    pub role: UserRole,
    /// Дата добавления
    pub added_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum UserRole {
    Owner,
    Admin,
    Developer,
    Viewer,
    Guest,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VisibilitySettings {
    /// Публичный проект
    pub is_public: bool,
    /// Разрешить анонимное чтение
    pub allow_anonymous_read: bool,
    /// Скрыть от поиска
    pub hide_from_search: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NotificationSettings {
    /// Уведомления о коммитах
    pub notify_on_commits: bool,
    /// Уведомления о issues
    pub notify_on_issues: bool,
    /// Уведомления о pull requests
    pub notify_on_pull_requests: bool,
    /// Email уведомления
    pub email_notifications: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectMetadata {
    /// Теги проекта
    pub tags: Vec<String>,
    /// Язык программирования
    pub primary_language: Option<String>,
    /// Лицензия
    pub license: Option<String>,
    /// Домашняя страница
    pub homepage: Option<String>,
    /// Размер проекта в байтах
    pub size: Option<u64>,
}

impl Default for ProjectConfig {
    fn default() -> Self {
        Self {
            collaboration: CollaborationSettings {
                allow_forks: true,
                allow_issues: true,
                allow_pull_requests: true,
                auto_merge: false,
                require_review: false,
                min_reviewers: 1,
            },
            roles: Vec::new(),
            visibility: VisibilitySettings {
                is_public: true,
                allow_anonymous_read: true,
                hide_from_search: false,
            },
            notifications: NotificationSettings {
                notify_on_commits: true,
                notify_on_issues: true,
                notify_on_pull_requests: true,
                email_notifications: false,
            },
            metadata: ProjectMetadata {
                tags: Vec::new(),
                primary_language: None,
                license: None,
                homepage: None,
                size: None,
            },
        }
    }
}

impl ProjectConfig {
    /// Создает конфигурацию для нового проекта с владельцем
    pub fn new_for_project(project_id: i64, owner_id: i64) -> Self {
        let mut config = Self::default();
        config.roles.push(ProjectRole {
            user_id: owner_id,
            role: UserRole::Owner,
            added_at: chrono::Utc::now().to_rfc3339(),
        });
        config
    }

    /// Сохраняет конфигурацию проекта в базу данных
    pub fn save(&self, project_id: i64, conn: Arc<Mutex<Connection>>) -> Result<()> {
        let config_json = serde_json::to_string(self)
            .map_err(|_| rusqlite::Error::ExecuteReturnedResults)?;
        
        let conn = conn.lock().unwrap();
        
        // Проверяем, существует ли уже конфигурация
        let mut stmt = conn.prepare("SELECT id FROM project_configs WHERE project_id = ?1")?;
        let exists = stmt.exists(params![project_id])?;
        
        if exists {
            // Обновляем существующую конфигурацию
            conn.execute(
                "UPDATE project_configs SET config_json = ?1 WHERE project_id = ?2",
                params![config_json, project_id],
            )?;
        } else {
            // Создаем новую конфигурацию
            conn.execute(
                "INSERT INTO project_configs (project_id, config_json) VALUES (?1, ?2)",
                params![project_id, config_json],
            )?;
        }
        
        Ok(())
    }

    /// Загружает конфигурацию проекта из базы данных
    pub fn load(project_id: i64, conn: Arc<Mutex<Connection>>) -> Result<ProjectConfig> {
        let conn = conn.lock().unwrap();
        
        let mut stmt = conn.prepare("SELECT config_json FROM project_configs WHERE project_id = ?1")?;
        let mut rows = stmt.query(params![project_id])?;
        
        if let Some(row) = rows.next()? {
            let config_json: String = row.get(0)?;
            let config: ProjectConfig = serde_json::from_str(&config_json)
                .map_err(|_| rusqlite::Error::ExecuteReturnedResults)?;
            Ok(config)
        } else {
            // Если конфигурация не найдена, возвращаем дефолтную
            Ok(ProjectConfig::default())
        }
    }
}

impl Project {
    /// Создаёт новый проект в базе данных
    pub fn create(&self, conn: Arc<Mutex<Connection>>) -> Result<i64> {
        let conn_guard = conn.lock().unwrap();
        
        // Добавляем проект в базу данных
        conn_guard.execute(
            "INSERT INTO projects (name, owner_id, description, is_public) VALUES (?1, ?2, ?3, ?4)",
            params![self.name, self.owner_id, self.description, self.is_public],
        )?;
        
        let project_id = conn_guard.last_insert_rowid();
        drop(conn_guard);

        // Создаём дефолтную конфигурацию проекта
        let config = ProjectConfig::new_for_project(project_id, self.owner_id);
        config.save(project_id, conn)?;
        
        debug!("Проект успешно создан: {} (ID: {})", self.name, project_id);
        
        Ok(project_id)
    }

    /// Получает конфигурацию проекта
    pub fn get_config(&self, conn: Arc<Mutex<Connection>>) -> Result<ProjectConfig> {
        if let Some(project_id) = self.id {
            ProjectConfig::load(project_id, conn)
        } else {
            Ok(ProjectConfig::default())
        }
    }

    /// Обновляет конфигурацию проекта
    pub fn update_config(&self, config: &ProjectConfig, conn: Arc<Mutex<Connection>>) -> Result<()> {
        if let Some(project_id) = self.id {
            config.save(project_id, conn)
        } else {
            Err(rusqlite::Error::ExecuteReturnedResults)
        }
    }

    /// Получает список проектов пользователя
    pub fn find_by_owner(owner_id: i64, conn: Arc<Mutex<Connection>>) -> Result<Vec<Project>> {
        let conn = conn.lock().unwrap();
        
        let mut stmt = conn.prepare(
            "SELECT id, name, owner_id, description, is_public, created_at FROM projects WHERE owner_id = ?1"
        )?;
        
        let projects = stmt.query_map(params![owner_id], |row| {
            Ok(Project {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                owner_id: row.get(2)?,
                description: row.get(3)?,
                is_public: row.get(4)?,
                created_at: row.get(5)?,
            })
        })?;
        
        let mut result = Vec::new();
        for project in projects {
            result.push(project?);
        }
        
        Ok(result)
    }

    /// Находит проект по имени
    pub fn find_by_name(name: &str, conn: Arc<Mutex<Connection>>) -> Result<Option<Project>> {
        let conn = conn.lock().unwrap();
        
        let mut stmt = conn.prepare(
            "SELECT id, name, owner_id, description, is_public, created_at FROM projects WHERE name = ?1"
        )?;
        
        let mut rows = stmt.query(params![name])?;
        
        if let Some(row) = rows.next()? {
            Ok(Some(Project {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                owner_id: row.get(2)?,
                description: row.get(3)?,
                is_public: row.get(4)?,
                created_at: row.get(5)?,
            }))
        } else {
            Ok(None)
        }
    }

    /// Находит проект по имени и владельцу
    pub fn find_by_name_and_owner(name: &str, owner_id: i64, conn: Arc<Mutex<Connection>>) -> Result<Option<Project>> {
        let conn = conn.lock().unwrap();
        
        let mut stmt = conn.prepare(
            "SELECT id, name, owner_id, description, is_public, created_at FROM projects WHERE name = ?1 AND owner_id = ?2"
        )?;
        
        let mut rows = stmt.query(params![name, owner_id])?;
        
        if let Some(row) = rows.next()? {
            Ok(Some(Project {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                owner_id: row.get(2)?,
                description: row.get(3)?,
                is_public: row.get(4)?,
                created_at: row.get(5)?,
            }))
        } else {
            Ok(None)
        }
    }

    /// Получает все публичные проекты
    pub fn find_public(conn: Arc<Mutex<Connection>>) -> Result<Vec<Project>> {
        let conn = conn.lock().unwrap();
        
        let mut stmt = conn.prepare(
            "SELECT id, name, owner_id, description, is_public, created_at FROM projects WHERE is_public = 1"
        )?;
        
        let projects = stmt.query_map([], |row| {
            Ok(Project {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                owner_id: row.get(2)?,
                description: row.get(3)?,
                is_public: row.get(4)?,
                created_at: row.get(5)?,
            })
        })?;
        
        let mut result = Vec::new();
        for project in projects {
            result.push(project?);
        }
        
        Ok(result)
    }
}
