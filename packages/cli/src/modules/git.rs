pub struct GitModule;

impl GitModule {
    pub fn new() -> Self {
        GitModule
    }

    pub fn status(&self) -> String {
        // Заглушка
        "Git status: clean".to_string()
    }
}
