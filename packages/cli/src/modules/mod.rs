pub mod git;
pub mod notes;
pub mod schedule;

// Можно добавить re-export, чтобы импортировать из одной точки
pub use git::GitModule;
pub use notes::NotesModule;
pub use schedule::ScheduleModule;
