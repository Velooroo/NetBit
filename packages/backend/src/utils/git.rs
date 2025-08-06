//! Утилиты для работы с Git

use std::process::Command;
use std::path::Path;
use log::{error, debug};

// ============================================================================
// СТРУКТУРЫ ДАННЫХ
// ============================================================================

/// Информация о Git репозитории
#[derive(Debug)]
pub struct GitRepoInfo {
    pub name: String,
    pub path: String,
    pub branches: Vec<String>,
    pub is_bare: bool,
}

/// Результат выполнения Git команды
#[derive(Debug)]
pub struct GitCommandResult {
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: Option<i32>,
}

// ============================================================================
// ОСНОВНЫЕ ФУНКЦИИ
// ============================================================================

/// Создает новый bare Git репозиторий
pub fn create_bare_repository(repo_path: &str) -> Result<(), String> {
    debug!("Creating bare repository at: {}", repo_path);
    
    let output = Command::new("git")
        .args(&["init", "--bare", repo_path])
        .output()
        .map_err(|e| format!("Failed to execute git command: {}", e))?;

    if output.status.success() {
        debug!("Successfully created bare repository");
        Ok(())
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        error!("Failed to create bare repository: {}", error_msg);
        Err(format!("Git init failed: {}", error_msg))
    }
}

/// Получает список веток репозитория
pub fn get_repository_branches(repo_path: &str) -> Result<Vec<String>, String> {
    debug!("Getting branches for repository: {}", repo_path);
    
    let output = Command::new("git")
        .args(&["--git-dir", repo_path, "branch", "--format=%(refname:short)"])
        .output()
        .map_err(|e| format!("Failed to execute git command: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let branches: Vec<String> = stdout
            .lines()
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();
        
        debug!("Found {} branches", branches.len());
        Ok(branches)
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        error!("Failed to get branches: {}", error_msg);
        Err(format!("Git branch command failed: {}", error_msg))
    }
}

/// Получает список файлов в определенной ветке
pub fn get_repository_files(repo_path: &str, branch: &str) -> Result<Vec<GitFile>, String> {
    debug!("Getting files for repository: {} branch: {}", repo_path, branch);
    
    let output = Command::new("git")
        .args(&["--git-dir", repo_path, "ls-tree", "-l", branch])
        .output()
        .map_err(|e| format!("Failed to execute git command: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let files = parse_git_ls_tree_output(&stdout);
        
        debug!("Found {} files", files.len());
        Ok(files)
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        error!("Failed to get files: {}", error_msg);
        Err(format!("Git ls-tree command failed: {}", error_msg))
    }
}

/// Проверяет существование репозитория
pub fn repository_exists(repo_path: &str) -> bool {
    Path::new(repo_path).exists() && 
    Path::new(&format!("{}/HEAD", repo_path)).exists()
}

/// Получает информацию о репозитории
pub fn get_repository_info(repo_path: &str) -> Result<GitRepoInfo, String> {
    if !repository_exists(repo_path) {
        return Err("Repository does not exist".to_string());
    }

    let name = Path::new(repo_path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .trim_end_matches(".git")
        .to_string();

    let branches = get_repository_branches(repo_path).unwrap_or_default();
    
    let is_bare = is_bare_repository(repo_path);

    Ok(GitRepoInfo {
        name,
        path: repo_path.to_string(),
        branches,
        is_bare,
    })
}

/// Проверяет, является ли репозиторий bare
pub fn is_bare_repository(repo_path: &str) -> bool {
    let output = Command::new("git")
        .args(&["--git-dir", repo_path, "config", "--get", "core.bare"])
        .output();

    if let Ok(output) = output {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            return stdout.trim() == "true";
        }
    }
    
    false
}

/// Выполняет произвольную Git команду
pub fn execute_git_command(args: &[&str], working_dir: Option<&str>) -> GitCommandResult {
    debug!("Executing git command: {:?}", args);
    
    let mut command = Command::new("git");
    command.args(args);
    
    if let Some(dir) = working_dir {
        command.current_dir(dir);
    }
    
    match command.output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            let success = output.status.success();
            let exit_code = output.status.code();
            
            if !success {
                error!("Git command failed: {:?}, stderr: {}", args, stderr);
            }
            
            GitCommandResult {
                success,
                stdout,
                stderr,
                exit_code,
            }
        },
        Err(e) => {
            error!("Failed to execute git command: {}", e);
            GitCommandResult {
                success: false,
                stdout: String::new(),
                stderr: format!("Failed to execute command: {}", e),
                exit_code: None,
            }
        }
    }
}

// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ СТРУКТУРЫ И ФУНКЦИИ
// ============================================================================

/// Информация о файле в Git репозитории
#[derive(Debug, Clone)]
pub struct GitFile {
    pub name: String,
    pub file_type: String, // "blob" (файл), "tree" (директория)
    pub hash: String,
    pub size: Option<u64>,
}

/// Парсит вывод команды git ls-tree
fn parse_git_ls_tree_output(output: &str) -> Vec<GitFile> {
    output
        .lines()
        .filter_map(|line| {
            let mut parts = line.split_whitespace();
            let _mode = parts.next()?;
            let file_type = parts.next()?.to_string();
            let hash = parts.next()?.to_string();
            let size_str = parts.next()?;
            let name = parts.collect::<Vec<&str>>().join(" ");
            
            let size = if file_type == "blob" {
                size_str.parse().ok()
            } else {
                None
            };
            
            Some(GitFile {
                name,
                file_type,
                hash,
                size,
            })
        })
        .collect()
}

/// Проверяет доступность Git в системе
pub fn check_git_availability() -> bool {
    Command::new("git")
        .arg("--version")
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}

/// Получает версию Git
pub fn get_git_version() -> Option<String> {
    let output = Command::new("git")
        .arg("--version")
        .output()
        .ok()?;
    
    if output.status.success() {
        let version = String::from_utf8_lossy(&output.stdout);
        Some(version.trim().to_string())
    } else {
        None
    }
}
