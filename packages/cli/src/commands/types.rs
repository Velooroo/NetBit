use serde::{Deserialize, Serialize};
use clap::{Parser, Subcommand};
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Parser, Debug)]
#[command(name = "netbit")]
#[command(about = "NetBit - Unified development ecosystem")]
pub struct NetBitCli {
    #[command(subcommand)]
    pub command: NetBitCommand,
}

#[derive(Subcommand, Debug)]
pub enum NetBitCommand {
    /// Notes and documentation management
    #[command(subcommand)]
    Note(NoteCommand),
    
    /// Schedule and reminders
    #[command(subcommand)]
    Schedule(ScheduleCommand),
    
    /// Project management
    #[command(subcommand)]
    Project(ProjectCommand),
    
    /// Daemon operations
    #[command(subcommand)]
    Daemon(DaemonCommand),
    
    /// TUI interface
    Tui,
    
    /// Repository operations (no git mentions)
    Push {
        #[arg(short, long)]
        message: Option<String>,
    },
    Pull,
    Status,
    
    /// Open built-in editor
    Edit {
        file: Option<String>,
    },
}

#[derive(Subcommand, Debug)]
pub enum GitCommand {
    /// Initialize a new project repository
    Init {
        #[arg(short, long)]
        name: String,
    },
    /// Add files to staging
    Add {
        files: Vec<String>,
    },
    /// Commit changes
    Commit {
        #[arg(short, long)]
        message: String,
    },
    /// Push to remote
    Push,
    /// Pull from remote
    Pull,
    /// Show status
    Status,
    /// Show log
    Log,
}

#[derive(Subcommand, Debug)]
pub enum NoteCommand {
    /// Add a new note
    Add {
        #[arg(short, long)]
        title: String,
        #[arg(short, long)]
        content: Option<String>,
        #[arg(long)]
        tags: Vec<String>,
    },
    /// List notes
    List {
        #[arg(short, long)]
        tag: Option<String>,
    },
    /// Edit a note
    Edit {
        id: String,
    },
    /// Delete a note
    Delete {
        id: String,
    },
    /// Search notes
    Search {
        query: String,
    },
}

#[derive(Subcommand, Debug)]
pub enum ScheduleCommand {
    /// Add a reminder
    Remind {
        #[arg(short, long)]
        message: String,
        #[arg(short, long)]
        time: String, // Format: "2024-01-01 15:30" or "15:30" for today
    },
    /// Set an alarm
    Alarm {
        #[arg(short, long)]
        time: String,
        #[arg(short, long)]
        message: Option<String>,
    },
    /// List scheduled items
    List,
    /// Cancel a scheduled item
    Cancel {
        id: String,
    },
}

#[derive(Subcommand, Debug)]
pub enum ProjectCommand {
    /// Create a new project
    New {
        name: String,
        #[arg(short, long)]
        template: Option<String>,
    },
    /// List projects
    List,
    /// Switch to project
    Switch {
        name: String,
    },
    /// Archive project
    Archive {
        name: String,
    },
    /// Project info
    Info {
        name: Option<String>,
    },
}

#[derive(Subcommand, Debug)]
pub enum DaemonCommand {
    /// Start daemon
    Start,
    /// Stop daemon
    Stop,
    /// Restart daemon
    Restart,
    /// Daemon status
    Status,
}

// Data structures for internal use
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Note {
    pub id: Uuid,
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ScheduledItem {
    pub id: Uuid,
    pub message: String,
    pub scheduled_time: DateTime<Utc>,
    pub item_type: ScheduleType,
    pub is_completed: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum ScheduleType {
    Reminder,
    Alarm,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Project {
    pub id: Uuid,
    pub name: String,
    pub path: String,
    pub description: Option<String>,
    pub created_at: DateTime<Utc>,
    pub last_accessed: DateTime<Utc>,
    pub is_archived: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CommandResult {
    pub success: bool,
    pub message: String,
    pub data: Option<serde_json::Value>,
}

impl CommandResult {
    pub fn success(message: String) -> Self {
        Self {
            success: true,
            message,
            data: None,
        }
    }
    
    pub fn success_with_data(message: String, data: serde_json::Value) -> Self {
        Self {
            success: true,
            message,
            data: Some(data),
        }
    }
    
    pub fn error(message: String) -> Self {
        Self {
            success: false,
            message,
            data: None,
        }
    }
}
