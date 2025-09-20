use super::types::*;
use std::fs;
use std::path::Path;
use uuid::Uuid;
use chrono::Utc;

pub struct ProjectsHandler {
    projects_dir: String,
    data_dir: String,
}

impl ProjectsHandler {
    pub fn new() -> Self {
        let data_dir = "./netbit_data".to_string();
        let projects_dir = "./projects".to_string();
        
        // Ensure directories exist
        let _ = fs::create_dir_all(&data_dir);
        let _ = fs::create_dir_all(&projects_dir);
        
        Self { projects_dir, data_dir }
    }

    pub async fn handle(&self, command: ProjectCommand) -> CommandResult {
        match command {
            ProjectCommand::New { name, template } => {
                self.create_project(name, template).await
            }
            ProjectCommand::List => {
                self.list_projects().await
            }
            ProjectCommand::Switch { name } => {
                self.switch_project(name).await
            }
            ProjectCommand::Archive { name } => {
                self.archive_project(name).await
            }
            ProjectCommand::Info { name } => {
                self.project_info(name).await
            }
        }
    }

    async fn create_project(&self, name: String, template: Option<String>) -> CommandResult {
        let project_path = format!("{}/{}", self.projects_dir, name);
        
        if Path::new(&project_path).exists() {
            return CommandResult::error(format!("Project '{}' already exists", name));
        }

        // Create project structure
        match fs::create_dir_all(&project_path) {
            Ok(_) => {
                // Create basic project structure
                let _ = fs::create_dir_all(format!("{}/src", project_path));
                let _ = fs::create_dir_all(format!("{}/docs", project_path));
                let _ = fs::create_dir_all(format!("{}/notes", project_path));
                let _ = fs::create_dir_all(format!("{}/assets", project_path));
                
                // Create project metadata
                let project = Project {
                    id: Uuid::new_v4(),
                    name: name.clone(),
                    path: project_path.clone(),
                    description: None,
                    created_at: Utc::now(),
                    last_accessed: Utc::now(),
                    is_archived: false,
                };

                // Save project metadata
                let projects_file = format!("{}/projects.json", self.data_dir);
                let mut projects = self.load_projects().await;
                projects.push(project.clone());
                
                if let Err(e) = self.save_projects(&projects).await {
                    return CommandResult::error(format!("Failed to save project metadata: {}", e));
                }

                // Create README based on template
                let readme_content = match template.as_deref() {
                    Some("rust") => self.create_rust_template(&name, &project_path),
                    Some("web") => self.create_web_template(&name, &project_path),
                    Some("python") => self.create_python_template(&name, &project_path),
                    Some("node") => self.create_node_template(&name, &project_path),
                    _ => self.create_basic_template(&name),
                };

                let _ = fs::write(format!("{}/README.md", project_path), readme_content);

                // Initialize git repository
                let _ = std::process::Command::new("git")
                    .args(&["init"])
                    .current_dir(&project_path)
                    .output();

                CommandResult::success_with_data(
                    format!("Project '{}' created successfully", name),
                    serde_json::json!({
                        "id": project.id,
                        "name": name,
                        "path": project_path,
                        "template": template.unwrap_or_else(|| "basic".to_string())
                    })
                )
            }
            Err(e) => CommandResult::error(format!("Failed to create project directory: {}", e)),
        }
    }

    async fn list_projects(&self) -> CommandResult {
        let projects = self.load_projects().await;
        
        if projects.is_empty() {
            CommandResult::success("No projects found".to_string())
        } else {
            let active_projects: Vec<&Project> = projects.iter().filter(|p| !p.is_archived).collect();
            let archived_projects: Vec<&Project> = projects.iter().filter(|p| p.is_archived).collect();

            let mut projects_summary = Vec::new();
            
            for project in &active_projects {
                projects_summary.push(serde_json::json!({
                    "id": project.id,
                    "name": project.name,
                    "path": project.path,
                    "description": project.description,
                    "created_at": project.created_at,
                    "last_accessed": project.last_accessed,
                    "status": "active"
                }));
            }
            
            for project in &archived_projects {
                projects_summary.push(serde_json::json!({
                    "id": project.id,
                    "name": project.name,
                    "path": project.path,
                    "description": project.description,
                    "created_at": project.created_at,
                    "last_accessed": project.last_accessed,
                    "status": "archived"
                }));
            }

            CommandResult::success_with_data(
                format!("Found {} projects ({} active, {} archived)", 
                    projects.len(), active_projects.len(), archived_projects.len()),
                serde_json::json!({ "projects": projects_summary })
            )
        }
    }

    async fn switch_project(&self, name: String) -> CommandResult {
        let mut projects = self.load_projects().await;
        
        if let Some(project) = projects.iter_mut().find(|p| p.name == name && !p.is_archived) {
            project.last_accessed = Utc::now();
            let project_name = project.name.clone();
            let project_path = project.path.clone();
            let project_id = project.id;
            
            if let Err(e) = self.save_projects(&projects).await {
                return CommandResult::error(format!("Failed to update project metadata: {}", e));
            }

            // Set current project (could be stored in a config file)
            let current_project_file = format!("{}/current_project.txt", self.data_dir);
            let _ = fs::write(current_project_file, &project_name);

            CommandResult::success_with_data(
                format!("Switched to project '{}'", name),
                serde_json::json!({
                    "name": project_name,
                    "path": project_path,
                    "id": project_id
                })
            )
        } else {
            CommandResult::error(format!("Project '{}' not found or is archived", name))
        }
    }

    async fn archive_project(&self, name: String) -> CommandResult {
        let mut projects = self.load_projects().await;
        
        if let Some(project) = projects.iter_mut().find(|p| p.name == name) {
            project.is_archived = !project.is_archived;
            let action = if project.is_archived { "archived" } else { "unarchived" };
            
            if let Err(e) = self.save_projects(&projects).await {
                return CommandResult::error(format!("Failed to update project metadata: {}", e));
            }

            CommandResult::success(format!("Project '{}' {}", name, action))
        } else {
            CommandResult::error(format!("Project '{}' not found", name))
        }
    }

    async fn project_info(&self, name: Option<String>) -> CommandResult {
        let projects = self.load_projects().await;
        
        let target_project = if let Some(ref project_name) = name {
            projects.iter().find(|p| p.name == *project_name)
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
            // Get additional project stats
            let mut stats = serde_json::json!({
                "id": project.id,
                "name": project.name,
                "path": project.path,
                "description": project.description,
                "created_at": project.created_at,
                "last_accessed": project.last_accessed,
                "is_archived": project.is_archived
            });

            // Count files in project
            if let Ok(entries) = fs::read_dir(&project.path) {
                let file_count = entries.count();
                stats["file_count"] = serde_json::json!(file_count);
            }

            // Check if it's a git repository
            let git_dir = format!("{}/.git", project.path);
            stats["is_git_repo"] = serde_json::json!(Path::new(&git_dir).exists());

            CommandResult::success_with_data(
                format!("Project '{}' information", project.name),
                stats
            )
        } else {
            let message = if let Some(project_name) = name {
                format!("Project '{}' not found", project_name)
            } else {
                "No current project set".to_string()
            };
            CommandResult::error(message)
        }
    }

    async fn load_projects(&self) -> Vec<Project> {
        let projects_file = format!("{}/projects.json", self.data_dir);
        
        if let Ok(content) = fs::read_to_string(projects_file) {
            serde_json::from_str(&content).unwrap_or_default()
        } else {
            Vec::new()
        }
    }

    async fn save_projects(&self, projects: &[Project]) -> Result<(), String> {
        let projects_file = format!("{}/projects.json", self.data_dir);
        
        match serde_json::to_string_pretty(projects) {
            Ok(json_content) => {
                fs::write(projects_file, json_content)
                    .map_err(|e| format!("Failed to write projects file: {}", e))
            }
            Err(e) => Err(format!("Failed to serialize projects: {}", e)),
        }
    }

    fn create_basic_template(&self, name: &str) -> String {
        format!(
            "# {}\n\nNetBit project created on {}\n\n## Structure\n\n- `src/` - Source code\n- `docs/` - Documentation\n- `notes/` - Project notes\n- `assets/` - Assets and resources\n\n## Getting Started\n\nAdd your project description and setup instructions here.\n",
            name,
            Utc::now().format("%Y-%m-%d")
        )
    }

    fn create_rust_template(&self, name: &str, project_path: &str) -> String {
        // Create Cargo.toml
        let cargo_toml = format!(
            "[package]\nname = \"{}\"\nversion = \"0.1.0\"\nedition = \"2021\"\n\n[dependencies]\n",
            name
        );
        let _ = fs::write(format!("{}/Cargo.toml", project_path), cargo_toml);

        // Create main.rs
        let main_rs = "fn main() {\n    println!(\"Hello, world!\");\n}\n";
        let _ = fs::write(format!("{}/src/main.rs", project_path), main_rs);

        format!(
            "# {}\n\nRust project created on {}\n\n## Building\n\n```bash\ncargo build\n```\n\n## Running\n\n```bash\ncargo run\n```\n",
            name,
            Utc::now().format("%Y-%m-%d")
        )
    }

    fn create_web_template(&self, name: &str, project_path: &str) -> String {
        // Create basic HTML
        let html_content = format!(
            "<!DOCTYPE html>\n<html>\n<head>\n    <title>{}</title>\n    <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n    <h1>Welcome to {}</h1>\n    <script src=\"script.js\"></script>\n</body>\n</html>\n",
            name, name
        );
        let _ = fs::write(format!("{}/index.html", project_path), html_content);

        // Create basic CSS
        let css_content = "body {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}\n\nh1 {\n    color: #333;\n}\n";
        let _ = fs::write(format!("{}/style.css", project_path), css_content);

        // Create basic JS
        let js_content = "console.log('Hello from NetBit!');\n";
        let _ = fs::write(format!("{}/script.js", project_path), js_content);

        format!(
            "# {}\n\nWeb project created on {}\n\n## Files\n\n- `index.html` - Main HTML file\n- `style.css` - Stylesheet\n- `script.js` - JavaScript\n\n## Getting Started\n\nOpen `index.html` in your browser to view the project.\n",
            name,
            Utc::now().format("%Y-%m-%d")
        )
    }

    fn create_python_template(&self, name: &str, project_path: &str) -> String {
        // Create main.py
        let main_py = "#!/usr/bin/env python3\n\ndef main():\n    print(\"Hello from NetBit!\")\n\nif __name__ == \"__main__\":\n    main()\n";
        let _ = fs::write(format!("{}/src/main.py", project_path), main_py);

        // Create requirements.txt
        let requirements = "# Add your dependencies here\n";
        let _ = fs::write(format!("{}/requirements.txt", project_path), requirements);

        format!(
            "# {}\n\nPython project created on {}\n\n## Setup\n\n```bash\npip install -r requirements.txt\n```\n\n## Running\n\n```bash\npython src/main.py\n```\n",
            name,
            Utc::now().format("%Y-%m-%d")
        )
    }

    fn create_node_template(&self, name: &str, project_path: &str) -> String {
        // Create package.json
        let package_json = format!(
            "{{\n  \"name\": \"{}\",\n  \"version\": \"1.0.0\",\n  \"description\": \"\",\n  \"main\": \"src/index.js\",\n  \"scripts\": {{\n    \"start\": \"node src/index.js\"\n  }},\n  \"dependencies\": {{}}\n}}\n",
            name
        );
        let _ = fs::write(format!("{}/package.json", project_path), package_json);

        // Create index.js
        let index_js = "console.log('Hello from NetBit!');\n";
        let _ = fs::write(format!("{}/src/index.js", project_path), index_js);

        format!(
            "# {}\n\nNode.js project created on {}\n\n## Setup\n\n```bash\nnpm install\n```\n\n## Running\n\n```bash\nnpm start\n```\n",
            name,
            Utc::now().format("%Y-%m-%d")
        )
    }
}
