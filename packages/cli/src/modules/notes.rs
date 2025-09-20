pub struct NotesModule;

impl NotesModule {
    pub fn new() -> Self {
        NotesModule
    }

    pub fn list_notes(&self) -> Vec<String> {
        vec!["idea.md".to_string(), "tasks.md".to_string()]
    }
}
