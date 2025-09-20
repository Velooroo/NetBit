use super::protocol::*;
use crate::daemon::notifications::NotificationService;
use crate::daemon::editor::NetBitEditor;
use std::fs;
use std::path::Path;
use uuid::Uuid;
use chrono::{Utc, DateTime, NaiveDateTime, TimeZone, Local};
use dirs;

pub struct NetBitServices {
    data_dir: String,
    notification_service: NotificationService,
}

impl NetBitServices {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let data_dir = dirs::home_dir()
            .unwrap_or_else(|| std::path::PathBuf::from("."))
            .join(".netbit")
            .to_string_lossy()
            .to_string();
        
        // Ensure data directory exists
        let _ = fs::create_dir_all(&data_dir);
        let _ = fs::create_dir_all(format!("{}/projects", data_dir));
        let _ = fs::create_dir_all(format!("{}/schedule", data_dir));

        let notification_service = NotificationService::new()?;

        Ok(Self {
            data_dir,
            notification_service,
        })
    }

    pub async fn handle_request(&self, request: DaemonRequest) -> DaemonResponse {
        match request {
            DaemonRequest::CreateProject { name, template } => {
                self.create_project(name, template).await
            }
            DaemonRequest::ListProjects => {
                self.list_projects().await
            }
            DaemonRequest::SwitchProject { name } => {
                self.switch_project(name).await
            }
            DaemonRequest::GetProjectInfo { name } => {
                self.get_project_info(name).await
            }
            DaemonRequest::Push { message } => {
                self.handle_push(message).await
            }
            DaemonRequest::Pull => {
                self.handle_pull().await
            }
            DaemonRequest::Status => {
                self.handle_status().await
            }
            DaemonRequest::CreateNote { project, title, content, tags } => {
                self.create_note(project, title, content, tags).await
            }
            DaemonRequest::ListNotes { project, tag } => {
                self.list_notes(project, tag).await
            }
            DaemonRequest::EditNote { id } => {
                self.edit_note(id).await
            }
            DaemonRequest::DeleteNote { id } => {
                self.delete_note(id).await
            }
            DaemonRequest::SearchNotes { project, query } => {
                self.search_notes(project, query).await
            }
            DaemonRequest::CreateReminder { message, time } => {
                self.create_reminder(message, time).await
            }
            DaemonRequest::CreateAlarm { time, message } => {
                self.create_alarm(time, message).await
            }
            DaemonRequest::ListScheduled => {
                self.list_scheduled().await
            }
            DaemonRequest::CancelScheduled { id } => {
                self.cancel_scheduled(id).await
            }
            DaemonRequest::OpenEditor { file_path, content } => {
                self.open_editor(file_path, content).await
            }
            DaemonRequest::Ping => DaemonResponse::Pong,
            DaemonRequest::GetStatus => {
                DaemonResponse::success("NetBit daemon is running".to_string())
            }
            DaemonRequest::Shutdown => {
                DaemonResponse::success("Shutting down daemon".to_string())
            }
        }
    }

    async fn create_project(&self, name: String, template: Option<String>) -> DaemonResponse {
        let projects_dir = format!("{}/projects", self.data_dir);
        let project_path = format!("{}/{}", projects_dir, name);
        
        if Path::new(&project_path).exists() {
            return DaemonResponse::error(format!("Project '{}' already exists", name));
        }

        // Create project structure
        match fs::create_dir_all(&project_path) {
            Ok(_) => {
                // Create project subdirectories
                let _ = fs::create_dir_all(format!("{}/src", project_path));
                let _ = fs::create_dir_all(format!("{}/docs", project_path));
                let _ = fs::create_dir_all(format!("{}/notes", project_path));
                let _ = fs::create_dir_all(format!("{}/assets", project_path));
                let _ = fs::create_dir_all(format!("{}/repositories", project_path));
                
                // Create project metadata
                let project = ProjectInfo {
                    id: Uuid::new_v4(),
                    name: name.clone(),
                    path: project_path.clone(),
                    description: None,
                    created_at: Utc::now(),
                    last_accessed: Utc::now(),
                    is_archived: false,
                    notes_count: 0,
                    repositories_count: 0,
                };

                // Save project metadata
                let mut projects = self.load_projects().await;
                projects.push(project.clone());
                
                if let Err(e) = self.save_projects(&projects).await {
                    return DaemonResponse::error(format!("Failed to save project metadata: {}", e));
                }

                // Create README based on template
                let readme_content = self.create_template_content(&name, &template);
                let _ = fs::write(format!("{}/README.md", project_path), readme_content);

                // Initialize repository
                let _ = std::process::Command::new("git")
                    .args(&["init"])
                    .current_dir(&project_path)
                    .output();

                DaemonResponse::success_with_data(
                    format!("Project '{}' created successfully", name),
                    serde_json::json!({
                        "id": project.id,
                        "name": name,
                        "path": project_path,
                        "template": template.unwrap_or_else(|| "basic".to_string())
                    })
                )
            }
            Err(e) => DaemonResponse::error(format!("Failed to create project directory: {}", e)),
        }
    }

    async fn list_projects(&self) -> DaemonResponse {
        let projects = self.load_projects().await;
        
        if projects.is_empty() {
            DaemonResponse::success("No projects found".to_string())
        } else {
            let projects_data: Vec<serde_json::Value> = projects.iter().map(|p| {
                serde_json::json!({
                    "id": p.id,
                    "name": p.name,
                    "path": p.path,
                    "description": p.description,
                    "created_at": p.created_at,
                    "last_accessed": p.last_accessed,
                    "is_archived": p.is_archived,
                    "notes_count": p.notes_count,
                    "repositories_count": p.repositories_count
                })
            }).collect();

            DaemonResponse::success_with_data(
                format!("Found {} projects", projects.len()),
                serde_json::json!({ "projects": projects_data })
            )
        }
    }

    async fn switch_project(&self, name: String) -> DaemonResponse {
        let mut projects = self.load_projects().await;
        
        if let Some(project) = projects.iter_mut().find(|p| p.name == name && !p.is_archived) {
            project.last_accessed = Utc::now();
            let project_name = project.name.clone();
            let project_path = project.path.clone();
            let project_id = project.id;
            
            if let Err(e) = self.save_projects(&projects).await {
                return DaemonResponse::error(format!("Failed to update project metadata: {}", e));
            }

            // Set current project
            let current_project_file = format!("{}/current_project.txt", self.data_dir);
            let _ = fs::write(current_project_file, &project_name);

            DaemonResponse::success_with_data(
                format!("Switched to project '{}'", name),
                serde_json::json!({
                    "name": project_name,
                    "path": project_path,
                    "id": project_id
                })
            )
        } else {
            DaemonResponse::error(format!("Project '{}' not found or is archived", name))
        }
    }

    async fn get_project_info(&self, name: Option<String>) -> DaemonResponse {
        let projects = self.load_projects().await;
        
        let target_project = if let Some(project_name) = name {
            projects.iter().find(|p| p.name == project_name)
        } else {
            // Get current project
            let current_project_file = format!("{}/current_project.txt", self.data_dir);
            if let Ok(current_name) = fs::read_to_string(current_project_file) {
                projects.iter().find(|p| p.name == current_name.trim())
            } else {
                None
            }
        };

        if let Some(project) = target_project {
            DaemonResponse::success_with_data(
                format!("Project '{}' information", project.name),
                serde_json::json!(project)
            )
        } else {
            DaemonResponse::error("Project not found".to_string())
        }
    }

    async fn create_note(&self, project: Option<String>, title: String, content: Option<String>, tags: Vec<String>) -> DaemonResponse {
        let project_name = project.unwrap_or_else(|| self.get_current_project());
        let notes_dir = format!("{}/projects/{}/notes", self.data_dir, project_name);
        
        // Ensure notes directory exists
        let _ = fs::create_dir_all(&notes_dir);

        let note = NoteInfo {
            id: Uuid::new_v4(),
            title: title.clone(),
            content_preview: content.clone().unwrap_or_else(|| format!("# {}\n\nCreated on {}", title, Utc::now().format("%Y-%m-%d %H:%M:%S"))),
            tags: tags.clone(),
            project: Some(project_name.clone()),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        let note_file = format!("{}/{}.json", notes_dir, note.id);
        
        match serde_json::to_string_pretty(&note) {
            Ok(json_content) => {
                match fs::write(&note_file, json_content) {
                    Ok(_) => {
                        // Also create a markdown file for easy editing
                        let md_file = format!("{}/{}.md", notes_dir, note.id);
                        let md_content = format!("# {}\n\nTags: {}\nProject: {}\n\n{}", 
                            note.title, 
                            note.tags.join(", "),
                            project_name,
                            note.content_preview
                        );
                        let _ = fs::write(md_file, md_content);
                        
                        DaemonResponse::success_with_data(
                            format!("Note '{}' created in project '{}'", title, project_name),
                            serde_json::json!({ "id": note.id, "title": title, "project": project_name })
                        )
                    }
                    Err(e) => DaemonResponse::error(format!("Failed to save note: {}", e)),
                }
            }
            Err(e) => DaemonResponse::error(format!("Failed to serialize note: {}", e)),
        }
    }

    async fn create_reminder(&self, message: String, time: String) -> DaemonResponse {
        match self.parse_time(&time) {
            Ok(scheduled_time) => {
                let item = ScheduledItemInfo {
                    id: Uuid::new_v4(),
                    message: message.clone(),
                    scheduled_time,
                    item_type: ScheduleType::Reminder,
                    is_completed: false,
                    time_until: self.format_time_until(scheduled_time),
                };

                // Save to file
                let schedule_file = format!("{}/schedule/{}.json", self.data_dir, item.id);
                if let Ok(json_content) = serde_json::to_string_pretty(&item) {
                    let _ = fs::write(&schedule_file, json_content);
                }

                // Schedule notification
                self.notification_service.schedule_reminder(item.id, message.clone(), scheduled_time).await;

                DaemonResponse::success_with_data(
                    format!("Reminder scheduled for {}", scheduled_time.with_timezone(&Local).format("%Y-%m-%d %H:%M:%S")),
                    serde_json::json!({
                        "id": item.id,
                        "message": message,
                        "scheduled_time": scheduled_time,
                        "type": "Reminder"
                    })
                )
            }
            Err(e) => DaemonResponse::error(format!("Invalid time format: {}", e)),
        }
    }

    async fn create_alarm(&self, time: String, message: Option<String>) -> DaemonResponse {
        match self.parse_time(&time) {
            Ok(scheduled_time) => {
                let alarm_message = message.unwrap_or_else(|| "Alarm".to_string());
                let item = ScheduledItemInfo {
                    id: Uuid::new_v4(),
                    message: alarm_message.clone(),
                    scheduled_time,
                    item_type: ScheduleType::Alarm,
                    is_completed: false,
                    time_until: self.format_time_until(scheduled_time),
                };

                // Save to file
                let schedule_file = format!("{}/schedule/{}.json", self.data_dir, item.id);
                if let Ok(json_content) = serde_json::to_string_pretty(&item) {
                    let _ = fs::write(&schedule_file, json_content);
                }

                // Schedule notification
                self.notification_service.schedule_alarm(item.id, alarm_message.clone(), scheduled_time).await;

                DaemonResponse::success_with_data(
                    format!("Alarm scheduled for {}", scheduled_time.with_timezone(&Local).format("%Y-%m-%d %H:%M:%S")),
                    serde_json::json!({
                        "id": item.id,
                        "message": alarm_message,
                        "scheduled_time": scheduled_time,
                        "type": "Alarm"
                    })
                )
            }
            Err(e) => DaemonResponse::error(format!("Invalid time format: {}", e)),
        }
    }

    // Repository operations (without git mentions)
    async fn handle_push(&self, message: Option<String>) -> DaemonResponse {
        let current_project = self.get_current_project();
        let project_path = format!("{}/projects/{}", self.data_dir, current_project);
        
        // Add all files
        let add_result = std::process::Command::new("git")
            .args(&["add", "."])
            .current_dir(&project_path)
            .output();

        if let Err(e) = add_result {
            return DaemonResponse::error(format!("Failed to add files: {}", e));
        }

        // Commit
        let commit_message = message.unwrap_or_else(|| {
            format!("Auto-commit: {}", Utc::now().format("%Y-%m-%d %H:%M:%S"))
        });

        let commit_result = std::process::Command::new("git")
            .args(&["commit", "-m", &commit_message])
            .current_dir(&project_path)
            .output();

        match commit_result {
            Ok(result) => {
                if result.status.success() {
                    // Try to push
                    let push_result = std::process::Command::new("git")
                        .args(&["push"])
                        .current_dir(&project_path)
                        .output();

                    match push_result {
                        Ok(push_res) => {
                            if push_res.status.success() {
                                DaemonResponse::success("Changes pushed successfully".to_string())
                            } else {
                                DaemonResponse::success("Changes committed locally (push failed - will retry when online)".to_string())
                            }
                        }
                        Err(_) => DaemonResponse::success("Changes committed locally (offline mode)".to_string()),
                    }
                } else {
                    DaemonResponse::error("Nothing to commit".to_string())
                }
            }
            Err(e) => DaemonResponse::error(format!("Commit failed: {}", e)),
        }
    }

    async fn handle_pull(&self) -> DaemonResponse {
        let current_project = self.get_current_project();
        let project_path = format!("{}/projects/{}", self.data_dir, current_project);
        
        let result = std::process::Command::new("git")
            .args(&["pull"])
            .current_dir(&project_path)
            .output();

        match result {
            Ok(output) => {
                if output.status.success() {
                    let stdout = String::from_utf8_lossy(&output.stdout);
                    DaemonResponse::success(format!("Pull completed: {}", stdout.trim()))
                } else {
                    DaemonResponse::error("Pull failed (offline or no remote)".to_string())
                }
            }
            Err(e) => DaemonResponse::error(format!("Pull command failed: {}", e)),
        }
    }

    async fn handle_status(&self) -> DaemonResponse {
        let current_project = self.get_current_project();
        let project_path = format!("{}/projects/{}", self.data_dir, current_project);
        
        let result = std::process::Command::new("git")
            .args(&["status", "--porcelain"])
            .current_dir(&project_path)
            .output();

        match result {
            Ok(output) => {
                if output.status.success() {
                    let stdout = String::from_utf8_lossy(&output.stdout);
                    if stdout.trim().is_empty() {
                        DaemonResponse::success("Working directory clean".to_string())
                    } else {
                        DaemonResponse::success_with_data(
                            "Repository status".to_string(),
                            serde_json::json!({ "status": stdout.trim(), "project": current_project })
                        )
                    }
                } else {
                    DaemonResponse::error("Not a repository".to_string())
                }
            }
            Err(e) => DaemonResponse::error(format!("Status command failed: {}", e)),
        }
    }

    async fn open_editor(&self, file_path: Option<String>, content: Option<String>) -> DaemonResponse {
        let mut editor = if let Some(path) = file_path {
            if let Some(content) = content {
                NetBitEditor::with_file(path, content)
            } else if let Ok(existing_content) = fs::read_to_string(&path) {
                NetBitEditor::with_file(path, existing_content)
            } else {
                NetBitEditor::with_file(path, String::new())
            }
        } else if let Some(content) = content {
            NetBitEditor::with_content(content)
        } else {
            NetBitEditor::new()
        };

        match editor.run().await {
            Ok((content, saved)) => {
                DaemonResponse::EditorResult { content, saved }
            }
            Err(e) => DaemonResponse::error(format!("Editor error: {}", e)),
        }
    }

    // Helper methods
    fn get_current_project(&self) -> String {
        let current_project_file = format!("{}/current_project.txt", self.data_dir);
        fs::read_to_string(current_project_file)
            .unwrap_or_else(|_| "default".to_string())
            .trim()
            .to_string()
    }

    async fn load_projects(&self) -> Vec<ProjectInfo> {
        let projects_file = format!("{}/projects.json", self.data_dir);
        
        if let Ok(content) = fs::read_to_string(projects_file) {
            serde_json::from_str(&content).unwrap_or_default()
        } else {
            Vec::new()
        }
    }

    async fn save_projects(&self, projects: &[ProjectInfo]) -> Result<(), String> {
        let projects_file = format!("{}/projects.json", self.data_dir);
        
        match serde_json::to_string_pretty(projects) {
            Ok(json_content) => {
                fs::write(projects_file, json_content)
                    .map_err(|e| format!("Failed to write projects file: {}", e))
            }
            Err(e) => Err(format!("Failed to serialize projects: {}", e)),
        }
    }

    fn create_template_content(&self, name: &str, template: &Option<String>) -> String {
        match template.as_deref() {
            Some("rust") => format!(
                "# {}\n\nRust project created on {}\n\n## Building\n\n```bash\ncargo build\n```\n\n## Running\n\n```bash\ncargo run\n```\n",
                name,
                Utc::now().format("%Y-%m-%d")
            ),
            Some("web") => format!(
                "# {}\n\nWeb project created on {}\n\n## Getting Started\n\nOpen `index.html` in your browser to view the project.\n",
                name,
                Utc::now().format("%Y-%m-%d")
            ),
            _ => format!(
                "# {}\n\nNetBit project created on {}\n\n## Structure\n\n- `src/` - Source code\n- `docs/` - Documentation\n- `notes/` - Project notes\n- `assets/` - Assets and resources\n- `repositories/` - Sub-repositories\n\n## Getting Started\n\nAdd your project description and setup instructions here.\n",
                name,
                Utc::now().format("%Y-%m-%d")
            )
        }
    }

    fn parse_time(&self, time_str: &str) -> Result<DateTime<Utc>, String> {
        let now = Local::now();
        
        // Format: "15:30" (today)
        if let Ok(time) = NaiveDateTime::parse_from_str(&format!("{} {}", now.format("%Y-%m-%d"), time_str), "%Y-%m-%d %H:%M") {
            let local_dt = Local.from_local_datetime(&time).single()
                .ok_or("Invalid local time")?;
            return Ok(local_dt.with_timezone(&Utc));
        }
        
        // Format: "in 30m", "in 2h", "in 1d"
        if time_str.starts_with("in ") {
            let duration_str = time_str.strip_prefix("in ").unwrap();
            if let Some(duration) = self.parse_duration(duration_str) {
                return Ok(Utc::now() + duration);
            }
        }
        
        Err(format!("Unsupported time format: '{}'", time_str))
    }
    
    fn parse_duration(&self, duration_str: &str) -> Option<chrono::Duration> {
        if duration_str.ends_with('m') {
            if let Ok(minutes) = duration_str.trim_end_matches('m').parse::<i64>() {
                return Some(chrono::Duration::minutes(minutes));
            }
        } else if duration_str.ends_with('h') {
            if let Ok(hours) = duration_str.trim_end_matches('h').parse::<i64>() {
                return Some(chrono::Duration::hours(hours));
            }
        } else if duration_str.ends_with('d') {
            if let Ok(days) = duration_str.trim_end_matches('d').parse::<i64>() {
                return Some(chrono::Duration::days(days));
            }
        }
        None
    }

    fn format_time_until(&self, scheduled_time: DateTime<Utc>) -> String {
        let now = Utc::now();
        if scheduled_time > now {
            let duration = scheduled_time.signed_duration_since(now);
            if duration.num_days() > 0 {
                format!("in {} days", duration.num_days())
            } else if duration.num_hours() > 0 {
                format!("in {} hours", duration.num_hours())
            } else if duration.num_minutes() > 0 {
                format!("in {} minutes", duration.num_minutes())
            } else {
                "very soon".to_string()
            }
        } else {
            "overdue".to_string()
        }
    }

    async fn list_notes(&self, project: Option<String>, tag: Option<String>) -> DaemonResponse {
        let project_name = project.unwrap_or_else(|| self.get_current_project());
        let notes_dir = format!("{}/projects/{}/notes", self.data_dir, project_name);
        
        let mut notes = Vec::new();
        
        if let Ok(entries) = fs::read_dir(&notes_dir) {
            for entry in entries.flatten() {
                if let Some(file_name) = entry.file_name().to_str() {
                    if file_name.ends_with(".json") {
                        if let Ok(content) = fs::read_to_string(entry.path()) {
                            if let Ok(note) = serde_json::from_str::<NoteInfo>(&content) {
                                // Apply tag filter if specified
                                if let Some(ref filter_tag) = tag {
                                    if !note.tags.iter().any(|t| t.contains(filter_tag)) {
                                        continue;
                                    }
                                }
                                notes.push(note);
                            }
                        }
                    }
                }
            }
        }

        // Sort by creation date (newest first)
        notes.sort_by(|a, b| b.created_at.cmp(&a.created_at));

        if notes.is_empty() {
            let message = if tag.is_some() {
                format!("No notes found with tag '{}' in project '{}'", tag.unwrap(), project_name)
            } else {
                format!("No notes found in project '{}'", project_name)
            };
            DaemonResponse::success(message)
        } else {
            let notes_data: Vec<serde_json::Value> = notes.iter().map(|note| {
                serde_json::json!({
                    "id": note.id,
                    "title": note.title,
                    "tags": note.tags,
                    "project": note.project,
                    "created_at": note.created_at,
                    "preview": note.content_preview.chars().take(100).collect::<String>()
                })
            }).collect();

            DaemonResponse::success_with_data(
                format!("Found {} notes in project '{}'", notes.len(), project_name),
                serde_json::json!({ "notes": notes_data })
            )
        }
    }

    async fn edit_note(&self, id: String) -> DaemonResponse {
        let current_project = self.get_current_project();
        let notes_dir = format!("{}/projects/{}/notes", self.data_dir, current_project);
        let note_file = format!("{}/{}.json", notes_dir, id);
        let md_file = format!("{}/{}.md", notes_dir, id);
        
        if !Path::new(&note_file).exists() {
            return DaemonResponse::error(format!("Note with ID '{}' not found", id));
        }

        // Read current note content
        let content = if Path::new(&md_file).exists() {
            fs::read_to_string(&md_file).unwrap_or_default()
        } else if let Ok(json_content) = fs::read_to_string(&note_file) {
            if let Ok(note) = serde_json::from_str::<NoteInfo>(&json_content) {
                format!("# {}\n\nTags: {}\n\n{}", note.title, note.tags.join(", "), note.content_preview)
            } else {
                String::new()
            }
        } else {
            String::new()
        };

        // Open editor
        let mut editor = NetBitEditor::with_file(md_file.clone(), content);
        match editor.run().await {
            Ok((new_content, saved)) => {
                if saved {
                    // Update the markdown file
                    let _ = fs::write(&md_file, &new_content);
                    
                    // Update the JSON file
                    if let Ok(json_content) = fs::read_to_string(&note_file) {
                        if let Ok(mut note) = serde_json::from_str::<NoteInfo>(&json_content) {
                            note.content_preview = new_content.clone();
                            note.updated_at = Utc::now();
                            
                            if let Ok(updated_json) = serde_json::to_string_pretty(&note) {
                                let _ = fs::write(&note_file, updated_json);
                            }
                        }
                    }
                    
                    DaemonResponse::success(format!("Note '{}' updated successfully", id))
                } else {
                    DaemonResponse::success("Note editing cancelled".to_string())
                }
            }
            Err(e) => DaemonResponse::error(format!("Editor error: {}", e)),
        }
    }

    async fn delete_note(&self, id: String) -> DaemonResponse {
        let current_project = self.get_current_project();
        let notes_dir = format!("{}/projects/{}/notes", self.data_dir, current_project);
        let note_file = format!("{}/{}.json", notes_dir, id);
        let md_file = format!("{}/{}.md", notes_dir, id);
        
        if !Path::new(&note_file).exists() {
            return DaemonResponse::error(format!("Note with ID '{}' not found", id));
        }

        // Read note title before deletion
        let title = if let Ok(json_content) = fs::read_to_string(&note_file) {
            if let Ok(note) = serde_json::from_str::<NoteInfo>(&json_content) {
                note.title
            } else {
                "Unknown".to_string()
            }
        } else {
            "Unknown".to_string()
        };

        match fs::remove_file(&note_file) {
            Ok(_) => {
                // Also remove markdown file if it exists
                let _ = fs::remove_file(&md_file);
                DaemonResponse::success(format!("Note '{}' deleted successfully", title))
            }
            Err(e) => DaemonResponse::error(format!("Failed to delete note: {}", e)),
        }
    }

    async fn search_notes(&self, project: Option<String>, query: String) -> DaemonResponse {
        let project_name = project.unwrap_or_else(|| self.get_current_project());
        let notes_dir = format!("{}/projects/{}/notes", self.data_dir, project_name);
        let query_lower = query.to_lowercase();
        
        let mut matching_notes = Vec::new();
        
        if let Ok(entries) = fs::read_dir(&notes_dir) {
            for entry in entries.flatten() {
                if let Some(file_name) = entry.file_name().to_str() {
                    if file_name.ends_with(".json") {
                        if let Ok(content) = fs::read_to_string(entry.path()) {
                            if let Ok(note) = serde_json::from_str::<NoteInfo>(&content) {
                                // Search in title, content, and tags
                                let matches = note.title.to_lowercase().contains(&query_lower) ||
                                            note.content_preview.to_lowercase().contains(&query_lower) ||
                                            note.tags.iter().any(|tag| tag.to_lowercase().contains(&query_lower));
                                
                                if matches {
                                    matching_notes.push(note);
                                }
                            }
                        }
                    }
                }
            }
        }

        // Sort by relevance (title matches first, then content matches)
        matching_notes.sort_by(|a, b| {
            let a_title_match = a.title.to_lowercase().contains(&query_lower);
            let b_title_match = b.title.to_lowercase().contains(&query_lower);
            
            match (a_title_match, b_title_match) {
                (true, false) => std::cmp::Ordering::Less,
                (false, true) => std::cmp::Ordering::Greater,
                _ => b.created_at.cmp(&a.created_at),
            }
        });

        if matching_notes.is_empty() {
            DaemonResponse::success(format!("No notes found matching '{}' in project '{}'", query, project_name))
        } else {
            let notes_data: Vec<serde_json::Value> = matching_notes.iter().map(|note| {
                serde_json::json!({
                    "id": note.id,
                    "title": note.title,
                    "tags": note.tags,
                    "project": note.project,
                    "created_at": note.created_at,
                    "preview": note.content_preview.chars().take(150).collect::<String>()
                })
            }).collect();

            DaemonResponse::success_with_data(
                format!("Found {} notes matching '{}' in project '{}'", matching_notes.len(), query, project_name),
                serde_json::json!({ "notes": notes_data })
            )
        }
    }

    async fn list_scheduled(&self) -> DaemonResponse {
        let mut items = Vec::new();
        let now = Utc::now();
        
        if let Ok(entries) = fs::read_dir(format!("{}/schedule", self.data_dir)) {
            for entry in entries.flatten() {
                if let Some(file_name) = entry.file_name().to_str() {
                    if file_name.ends_with(".json") {
                        if let Ok(content) = fs::read_to_string(entry.path()) {
                            if let Ok(item) = serde_json::from_str::<ScheduledItemInfo>(&content) {
                                // Only include future items or items from today
                                if !item.is_completed && item.scheduled_time > now.checked_sub_signed(chrono::Duration::hours(24)).unwrap_or(now) {
                                    items.push(item);
                                }
                            }
                        }
                    }
                }
            }
        }

        // Sort by scheduled time
        items.sort_by(|a, b| a.scheduled_time.cmp(&b.scheduled_time));

        if items.is_empty() {
            DaemonResponse::success("No scheduled items found".to_string())
        } else {
            let items_data: Vec<serde_json::Value> = items.iter().map(|item| {
                let type_str = match item.item_type {
                    ScheduleType::Reminder => "Reminder",
                    ScheduleType::Alarm => "Alarm",
                };
                
                let time_until = self.format_time_until(item.scheduled_time);
                let is_overdue = item.scheduled_time <= now;

                serde_json::json!({
                    "id": item.id,
                    "message": item.message,
                    "type": type_str,
                    "scheduled_time": item.scheduled_time.with_timezone(&Local).format("%Y-%m-%d %H:%M:%S").to_string(),
                    "time_until": time_until,
                    "is_overdue": is_overdue
                })
            }).collect();

            DaemonResponse::success_with_data(
                format!("Found {} scheduled items", items.len()),
                serde_json::json!({ "items": items_data })
            )
        }
    }

    async fn cancel_scheduled(&self, id: String) -> DaemonResponse {
        let schedule_file = format!("{}/schedule/{}.json", self.data_dir, id);
        
        if !Path::new(&schedule_file).exists() {
            return DaemonResponse::error(format!("Scheduled item with ID '{}' not found", id));
        }

        // Read item details before deletion
        let (message, type_str) = if let Ok(content) = fs::read_to_string(&schedule_file) {
            if let Ok(item) = serde_json::from_str::<ScheduledItemInfo>(&content) {
                let type_str = match item.item_type {
                    ScheduleType::Reminder => "Reminder",
                    ScheduleType::Alarm => "Alarm",
                };
                (item.message, type_str.to_string())
            } else {
                ("Unknown".to_string(), "Item".to_string())
            }
        } else {
            ("Unknown".to_string(), "Item".to_string())
        };

        match fs::remove_file(&schedule_file) {
            Ok(_) => {
                DaemonResponse::success(format!("{} '{}' cancelled successfully", type_str, message))
            }
            Err(e) => DaemonResponse::error(format!("Failed to cancel scheduled item: {}", e)),
        }
    }
}
