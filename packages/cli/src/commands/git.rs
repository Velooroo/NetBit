use super::types::*;
use std::process::Command;
use std::path::Path;

pub struct GitHandler;

impl GitHandler {
    pub fn new() -> Self {
        Self
    }

    pub async fn handle(&self, command: GitCommand) -> CommandResult {
        match command {
            GitCommand::Init { name } => self.init_project(&name).await,
            GitCommand::Add { files } => self.add_files(files).await,
            GitCommand::Commit { message } => self.commit(&message).await,
            GitCommand::Push => self.push().await,
            GitCommand::Pull => self.pull().await,
            GitCommand::Status => self.status().await,
            GitCommand::Log => self.log().await,
        }
    }

    async fn init_project(&self, name: &str) -> CommandResult {
        // Create project directory structure
        let project_path = format!("./projects/{}", name);
        
        if Path::new(&project_path).exists() {
            return CommandResult::error(format!("Project '{}' already exists", name));
        }

        // Create directory structure
        match std::fs::create_dir_all(&project_path) {
            Ok(_) => {
                // Initialize git repository
                let output = Command::new("git")
                    .args(&["init"])
                    .current_dir(&project_path)
                    .output();

                match output {
                    Ok(result) => {
                        if result.status.success() {
                            // Create basic project structure
                            let _ = std::fs::create_dir_all(format!("{}/src", project_path));
                            let _ = std::fs::create_dir_all(format!("{}/docs", project_path));
                            let _ = std::fs::create_dir_all(format!("{}/notes", project_path));
                            
                            // Create README
                            let readme_content = format!("# {}\n\nNetBit project created on {}\n", 
                                name, chrono::Utc::now().format("%Y-%m-%d"));
                            let _ = std::fs::write(format!("{}/README.md", project_path), readme_content);
                            
                            CommandResult::success(format!("Project '{}' initialized successfully", name))
                        } else {
                            CommandResult::error("Failed to initialize git repository".to_string())
                        }
                    }
                    Err(e) => CommandResult::error(format!("Git command failed: {}", e)),
                }
            }
            Err(e) => CommandResult::error(format!("Failed to create project directory: {}", e)),
        }
    }

    async fn add_files(&self, files: Vec<String>) -> CommandResult {
        let mut args = vec!["add"];
        let file_refs: Vec<&str> = files.iter().map(|s| s.as_str()).collect();
        args.extend(file_refs);

        let output = Command::new("git")
            .args(&args)
            .output();

        match output {
            Ok(result) => {
                if result.status.success() {
                    CommandResult::success(format!("Added {} files to staging", files.len()))
                } else {
                    let error = String::from_utf8_lossy(&result.stderr);
                    CommandResult::error(format!("Git add failed: {}", error))
                }
            }
            Err(e) => CommandResult::error(format!("Git command failed: {}", e)),
        }
    }

    async fn commit(&self, message: &str) -> CommandResult {
        let output = Command::new("git")
            .args(&["commit", "-m", message])
            .output();

        match output {
            Ok(result) => {
                if result.status.success() {
                    CommandResult::success(format!("Committed with message: '{}'", message))
                } else {
                    let error = String::from_utf8_lossy(&result.stderr);
                    CommandResult::error(format!("Git commit failed: {}", error))
                }
            }
            Err(e) => CommandResult::error(format!("Git command failed: {}", e)),
        }
    }

    async fn push(&self) -> CommandResult {
        let output = Command::new("git")
            .args(&["push"])
            .output();

        match output {
            Ok(result) => {
                if result.status.success() {
                    CommandResult::success("Pushed to remote successfully".to_string())
                } else {
                    let error = String::from_utf8_lossy(&result.stderr);
                    CommandResult::error(format!("Git push failed: {}", error))
                }
            }
            Err(e) => CommandResult::error(format!("Git command failed: {}", e)),
        }
    }

    async fn pull(&self) -> CommandResult {
        let output = Command::new("git")
            .args(&["pull"])
            .output();

        match output {
            Ok(result) => {
                if result.status.success() {
                    let stdout = String::from_utf8_lossy(&result.stdout);
                    CommandResult::success(format!("Pull completed: {}", stdout.trim()))
                } else {
                    let error = String::from_utf8_lossy(&result.stderr);
                    CommandResult::error(format!("Git pull failed: {}", error))
                }
            }
            Err(e) => CommandResult::error(format!("Git command failed: {}", e)),
        }
    }

    async fn status(&self) -> CommandResult {
        let output = Command::new("git")
            .args(&["status", "--porcelain"])
            .output();

        match output {
            Ok(result) => {
                if result.status.success() {
                    let stdout = String::from_utf8_lossy(&result.stdout);
                    if stdout.trim().is_empty() {
                        CommandResult::success("Working directory clean".to_string())
                    } else {
                        CommandResult::success_with_data(
                            "Repository status".to_string(),
                            serde_json::json!({ "status": stdout.trim() })
                        )
                    }
                } else {
                    let error = String::from_utf8_lossy(&result.stderr);
                    CommandResult::error(format!("Git status failed: {}", error))
                }
            }
            Err(e) => CommandResult::error(format!("Git command failed: {}", e)),
        }
    }

    async fn log(&self) -> CommandResult {
        let output = Command::new("git")
            .args(&["log", "--oneline", "-10"])
            .output();

        match output {
            Ok(result) => {
                if result.status.success() {
                    let stdout = String::from_utf8_lossy(&result.stdout);
                    CommandResult::success_with_data(
                        "Recent commits".to_string(),
                        serde_json::json!({ "log": stdout.trim() })
                    )
                } else {
                    let error = String::from_utf8_lossy(&result.stderr);
                    CommandResult::error(format!("Git log failed: {}", error))
                }
            }
            Err(e) => CommandResult::error(format!("Git command failed: {}", e)),
        }
    }
}
