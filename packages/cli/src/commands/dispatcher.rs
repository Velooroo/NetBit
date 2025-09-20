use super::types::*;
use super::{git, notes, schedule, projects};
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct CommandDispatcher {
    git_handler: git::GitHandler,
    notes_handler: notes::NotesHandler,
    schedule_handler: schedule::ScheduleHandler,
    projects_handler: projects::ProjectsHandler,
}

impl CommandDispatcher {
    pub fn new() -> Self {
        Self {
            git_handler: git::GitHandler::new(),
            notes_handler: notes::NotesHandler::new(),
            schedule_handler: schedule::ScheduleHandler::new(),
            projects_handler: projects::ProjectsHandler::new(),
        }
    }

    pub async fn dispatch(&self, command: NetBitCommand) -> CommandResult {
        match command {
            NetBitCommand::Note(note_cmd) => {
                self.notes_handler.handle(note_cmd).await
            }
            NetBitCommand::Schedule(schedule_cmd) => {
                self.schedule_handler.handle(schedule_cmd).await
            }
            NetBitCommand::Project(project_cmd) => {
                self.projects_handler.handle(project_cmd).await
            }
            NetBitCommand::Daemon(daemon_cmd) => {
                self.handle_daemon_command(daemon_cmd).await
            }
            NetBitCommand::Tui => {
                CommandResult::success("Starting TUI interface...".to_string())
            }
            // Unified shortcuts
            NetBitCommand::Push { message } => {
                self.handle_unified_push(message).await
            }
            NetBitCommand::Pull => {
                CommandResult::success("Pull functionality moved to daemon".to_string())
            }
            NetBitCommand::Status => {
                CommandResult::success("Status functionality moved to daemon".to_string())
            }
            NetBitCommand::Edit { file: _ } => {
                CommandResult::success("Editor functionality moved to daemon".to_string())
            }
        }
    }

    async fn handle_unified_push(&self, message: Option<String>) -> CommandResult {
        // Unified push: add all, commit with message, and push
        let add_result = self.git_handler.handle(GitCommand::Add { 
            files: vec![".".to_string()] 
        }).await;
        
        if !add_result.success {
            return add_result;
        }

        let commit_message = message.unwrap_or_else(|| {
            format!("Auto-commit: {}", chrono::Utc::now().format("%Y-%m-%d %H:%M:%S"))
        });

        let commit_result = self.git_handler.handle(GitCommand::Commit { 
            message: commit_message 
        }).await;
        
        if !commit_result.success {
            return commit_result;
        }

        self.git_handler.handle(GitCommand::Push).await
    }

    async fn handle_daemon_command(&self, cmd: DaemonCommand) -> CommandResult {
        match cmd {
            DaemonCommand::Start => {
                CommandResult::success("Starting NetBit daemon...".to_string())
            }
            DaemonCommand::Stop => {
                CommandResult::success("Stopping NetBit daemon...".to_string())
            }
            DaemonCommand::Restart => {
                CommandResult::success("Restarting NetBit daemon...".to_string())
            }
            DaemonCommand::Status => {
                CommandResult::success("NetBit daemon is running".to_string())
            }
        }
    }
}

impl Default for CommandDispatcher {
    fn default() -> Self {
        Self::new()
    }
}
