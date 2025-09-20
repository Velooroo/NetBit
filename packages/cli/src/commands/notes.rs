use super::types::*;
use std::fs;
use std::path::Path;
use uuid::Uuid;
use chrono::Utc;

pub struct NotesHandler {
    notes_dir: String,
}

impl NotesHandler {
    pub fn new() -> Self {
        let notes_dir = "./netbit_data/notes".to_string();
        // Ensure notes directory exists
        let _ = fs::create_dir_all(&notes_dir);
        Self { notes_dir }
    }

    pub async fn handle(&self, command: NoteCommand) -> CommandResult {
        match command {
            NoteCommand::Add { title, content, tags } => {
                self.add_note(title, content, tags).await
            }
            NoteCommand::List { tag } => {
                self.list_notes(tag).await
            }
            NoteCommand::Edit { id } => {
                self.edit_note(id).await
            }
            NoteCommand::Delete { id } => {
                self.delete_note(id).await
            }
            NoteCommand::Search { query } => {
                self.search_notes(query).await
            }
        }
    }

    async fn add_note(&self, title: String, content: Option<String>, tags: Vec<String>) -> CommandResult {
        let note = Note {
            id: Uuid::new_v4(),
            title: title.clone(),
            content: content.unwrap_or_else(|| {
                // If no content provided, open editor or use empty content
                format!("# {}\n\nCreated on {}", title, Utc::now().format("%Y-%m-%d %H:%M:%S"))
            }),
            tags,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        let note_file = format!("{}/{}.json", self.notes_dir, note.id);
        
        match serde_json::to_string_pretty(&note) {
            Ok(json_content) => {
                match fs::write(&note_file, json_content) {
                    Ok(_) => {
                        // Also create a markdown file for easy editing
                        let md_file = format!("{}/{}.md", self.notes_dir, note.id);
                        let md_content = format!("# {}\n\nTags: {}\n\n{}", 
                            note.title, 
                            note.tags.join(", "),
                            note.content
                        );
                        let _ = fs::write(md_file, md_content);
                        
                        CommandResult::success_with_data(
                            format!("Note '{}' created successfully", title),
                            serde_json::json!({ "id": note.id, "title": title })
                        )
                    }
                    Err(e) => CommandResult::error(format!("Failed to save note: {}", e)),
                }
            }
            Err(e) => CommandResult::error(format!("Failed to serialize note: {}", e)),
        }
    }

    async fn list_notes(&self, tag_filter: Option<String>) -> CommandResult {
        let mut notes = Vec::new();
        
        if let Ok(entries) = fs::read_dir(&self.notes_dir) {
            for entry in entries.flatten() {
                if let Some(file_name) = entry.file_name().to_str() {
                    if file_name.ends_with(".json") {
                        if let Ok(content) = fs::read_to_string(entry.path()) {
                            if let Ok(note) = serde_json::from_str::<Note>(&content) {
                                // Apply tag filter if specified
                                if let Some(ref filter_tag) = tag_filter {
                                    if !note.tags.iter().any(|tag| tag.contains(filter_tag)) {
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
            let message = if tag_filter.is_some() {
                format!("No notes found with tag '{}'", tag_filter.unwrap())
            } else {
                "No notes found".to_string()
            };
            CommandResult::success(message)
        } else {
            let notes_summary: Vec<serde_json::Value> = notes.iter().map(|note| {
                serde_json::json!({
                    "id": note.id,
                    "title": note.title,
                    "tags": note.tags,
                    "created_at": note.created_at,
                    "preview": note.content.chars().take(100).collect::<String>()
                })
            }).collect();

            CommandResult::success_with_data(
                format!("Found {} notes", notes.len()),
                serde_json::json!({ "notes": notes_summary })
            )
        }
    }

    async fn edit_note(&self, id: String) -> CommandResult {
        let note_file = format!("{}/{}.json", self.notes_dir, id);
        let md_file = format!("{}/{}.md", self.notes_dir, id);
        
        if !Path::new(&note_file).exists() {
            return CommandResult::error(format!("Note with ID '{}' not found", id));
        }

        // For now, just indicate that the note can be edited
        // In a real implementation, you might open an editor
        CommandResult::success_with_data(
            format!("Note '{}' ready for editing", id),
            serde_json::json!({
                "json_file": note_file,
                "markdown_file": md_file,
                "instruction": "Edit the .md file and the changes will be reflected"
            })
        )
    }

    async fn delete_note(&self, id: String) -> CommandResult {
        let note_file = format!("{}/{}.json", self.notes_dir, id);
        let md_file = format!("{}/{}.md", self.notes_dir, id);
        
        if !Path::new(&note_file).exists() {
            return CommandResult::error(format!("Note with ID '{}' not found", id));
        }

        // Read note title before deletion for confirmation
        let title = if let Ok(content) = fs::read_to_string(&note_file) {
            if let Ok(note) = serde_json::from_str::<Note>(&content) {
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
                CommandResult::success(format!("Note '{}' deleted successfully", title))
            }
            Err(e) => CommandResult::error(format!("Failed to delete note: {}", e)),
        }
    }

    async fn search_notes(&self, query: String) -> CommandResult {
        let mut matching_notes = Vec::new();
        let query_lower = query.to_lowercase();
        
        if let Ok(entries) = fs::read_dir(&self.notes_dir) {
            for entry in entries.flatten() {
                if let Some(file_name) = entry.file_name().to_str() {
                    if file_name.ends_with(".json") {
                        if let Ok(content) = fs::read_to_string(entry.path()) {
                            if let Ok(note) = serde_json::from_str::<Note>(&content) {
                                // Search in title, content, and tags
                                let matches = note.title.to_lowercase().contains(&query_lower) ||
                                            note.content.to_lowercase().contains(&query_lower) ||
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
            CommandResult::success(format!("No notes found matching '{}'", query))
        } else {
            let notes_summary: Vec<serde_json::Value> = matching_notes.iter().map(|note| {
                serde_json::json!({
                    "id": note.id,
                    "title": note.title,
                    "tags": note.tags,
                    "created_at": note.created_at,
                    "preview": note.content.chars().take(150).collect::<String>()
                })
            }).collect();

            CommandResult::success_with_data(
                format!("Found {} notes matching '{}'", matching_notes.len(), query),
                serde_json::json!({ "notes": notes_summary })
            )
        }
    }
}
