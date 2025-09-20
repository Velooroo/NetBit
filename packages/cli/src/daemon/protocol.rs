use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum DaemonRequest {
    // Project management
    CreateProject {
        name: String,
        template: Option<String>,
    },
    ListProjects,
    SwitchProject {
        name: String,
    },
    GetProjectInfo {
        name: Option<String>,
    },
    
    // Repository operations (no git mentions)
    Push {
        message: Option<String>,
    },
    Pull,
    Status,
    
    // Notes within projects
    CreateNote {
        project: Option<String>,
        title: String,
        content: Option<String>,
        tags: Vec<String>,
    },
    ListNotes {
        project: Option<String>,
        tag: Option<String>,
    },
    EditNote {
        id: String,
    },
    DeleteNote {
        id: String,
    },
    SearchNotes {
        project: Option<String>,
        query: String,
    },
    
    // Schedule and reminders
    CreateReminder {
        message: String,
        time: String,
    },
    CreateAlarm {
        time: String,
        message: Option<String>,
    },
    ListScheduled,
    CancelScheduled {
        id: String,
    },
    
    // Editor
    OpenEditor {
        file_path: Option<String>,
        content: Option<String>,
    },
    
    // Daemon control
    Ping,
    Shutdown,
    GetStatus,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum DaemonResponse {
    Success {
        message: String,
        data: Option<serde_json::Value>,
    },
    Error {
        message: String,
    },
    EditorResult {
        content: String,
        saved: bool,
    },
    Pong,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProjectInfo {
    pub id: Uuid,
    pub name: String,
    pub path: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub last_accessed: DateTime<Utc>,
    pub is_archived: bool,
    pub notes_count: usize,
    pub repositories_count: usize,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NoteInfo {
    pub id: Uuid,
    pub title: String,
    pub content_preview: String,
    pub tags: Vec<String>,
    pub project: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ScheduledItemInfo {
    pub id: Uuid,
    pub message: String,
    pub scheduled_time: DateTime<Utc>,
    pub item_type: ScheduleType,
    pub is_completed: bool,
    pub time_until: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum ScheduleType {
    Reminder,
    Alarm,
}

impl DaemonResponse {
    pub fn success(message: String) -> Self {
        Self::Success {
            message,
            data: None,
        }
    }
    
    pub fn success_with_data(message: String, data: serde_json::Value) -> Self {
        Self::Success {
            message,
            data: Some(data),
        }
    }
    
    pub fn error(message: String) -> Self {
        Self::Error { message }
    }
}
