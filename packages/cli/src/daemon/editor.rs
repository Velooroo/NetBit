use crossterm::{
    cursor::{MoveTo, Show, Hide},
    event::{self, Event, KeyCode, KeyEvent, KeyModifiers},
    execute,
    style::{Color, Print, ResetColor, SetForegroundColor},
    terminal::{self, Clear, ClearType, EnterAlternateScreen, LeaveAlternateScreen},
};
use std::io::{self, Write};

pub struct NetBitEditor {
    content: Vec<String>,
    cursor_x: usize,
    cursor_y: usize,
    scroll_offset: usize,
    file_path: Option<String>,
    modified: bool,
    status_message: String,
}

impl NetBitEditor {
    pub fn new() -> Self {
        Self {
            content: vec![String::new()],
            cursor_x: 0,
            cursor_y: 0,
            scroll_offset: 0,
            file_path: None,
            modified: false,
            status_message: "NetBit Editor - Ctrl+S to save, Ctrl+Q to quit".to_string(),
        }
    }

    pub fn with_content(content: String) -> Self {
        let lines: Vec<String> = content.lines().map(|s| s.to_string()).collect();
        let lines = if lines.is_empty() {
            vec![String::new()]
        } else {
            lines
        };

        Self {
            content: lines,
            cursor_x: 0,
            cursor_y: 0,
            scroll_offset: 0,
            file_path: None,
            modified: false,
            status_message: "NetBit Editor - Ctrl+S to save, Ctrl+Q to quit".to_string(),
        }
    }

    pub fn with_file(file_path: String, content: String) -> Self {
        let mut editor = Self::with_content(content);
        editor.file_path = Some(file_path);
        editor
    }

    pub async fn run(&mut self) -> io::Result<(String, bool)> {
        // Enter alternate screen and hide cursor
        execute!(io::stdout(), EnterAlternateScreen, Hide)?;
        terminal::enable_raw_mode()?;

        let result = self.editor_loop().await;

        // Restore terminal
        terminal::disable_raw_mode()?;
        execute!(io::stdout(), LeaveAlternateScreen, Show)?;

        result
    }

    async fn editor_loop(&mut self) -> io::Result<(String, bool)> {
        let mut saved = false;

        loop {
            self.draw_screen()?;

            if let Event::Key(key_event) = event::read()? {
                match self.handle_key_event(key_event) {
                    EditorAction::Continue => continue,
                    EditorAction::Save => {
                        saved = true;
                        self.status_message = "File saved!".to_string();
                    }
                    EditorAction::Quit => break,
                    EditorAction::SaveAndQuit => {
                        saved = true;
                        break;
                    }
                }
            }
        }

        let content = self.content.join("\n");
        Ok((content, saved))
    }

    fn handle_key_event(&mut self, key_event: KeyEvent) -> EditorAction {
        match key_event {
            // Quit
            KeyEvent {
                code: KeyCode::Char('q'),
                modifiers: KeyModifiers::CONTROL,
                ..
            } => {
                if self.modified {
                    self.status_message = "File modified! Press Ctrl+S to save, Ctrl+Q again to quit without saving".to_string();
                    EditorAction::Continue
                } else {
                    EditorAction::Quit
                }
            }

            // Save
            KeyEvent {
                code: KeyCode::Char('s'),
                modifiers: KeyModifiers::CONTROL,
                ..
            } => {
                self.modified = false;
                EditorAction::Save
            }

            // Save and quit
            KeyEvent {
                code: KeyCode::Char('x'),
                modifiers: KeyModifiers::CONTROL,
                ..
            } => EditorAction::SaveAndQuit,

            // Navigation
            KeyEvent {
                code: KeyCode::Up, ..
            } => {
                if self.cursor_y > 0 {
                    self.cursor_y -= 1;
                    self.adjust_cursor_x();
                }
                EditorAction::Continue
            }

            KeyEvent {
                code: KeyCode::Down,
                ..
            } => {
                if self.cursor_y < self.content.len() - 1 {
                    self.cursor_y += 1;
                    self.adjust_cursor_x();
                }
                EditorAction::Continue
            }

            KeyEvent {
                code: KeyCode::Left,
                ..
            } => {
                if self.cursor_x > 0 {
                    self.cursor_x -= 1;
                } else if self.cursor_y > 0 {
                    self.cursor_y -= 1;
                    self.cursor_x = self.content[self.cursor_y].len();
                }
                EditorAction::Continue
            }

            KeyEvent {
                code: KeyCode::Right,
                ..
            } => {
                let current_line_len = self.content[self.cursor_y].len();
                if self.cursor_x < current_line_len {
                    self.cursor_x += 1;
                } else if self.cursor_y < self.content.len() - 1 {
                    self.cursor_y += 1;
                    self.cursor_x = 0;
                }
                EditorAction::Continue
            }

            KeyEvent {
                code: KeyCode::Home,
                ..
            } => {
                self.cursor_x = 0;
                EditorAction::Continue
            }

            KeyEvent {
                code: KeyCode::End, ..
            } => {
                self.cursor_x = self.content[self.cursor_y].len();
                EditorAction::Continue
            }

            // Text input
            KeyEvent {
                code: KeyCode::Char(c),
                modifiers: KeyModifiers::NONE | KeyModifiers::SHIFT,
                ..
            } => {
                self.insert_char(c);
                EditorAction::Continue
            }

            KeyEvent {
                code: KeyCode::Enter,
                ..
            } => {
                self.insert_newline();
                EditorAction::Continue
            }

            KeyEvent {
                code: KeyCode::Backspace,
                ..
            } => {
                self.delete_char();
                EditorAction::Continue
            }

            KeyEvent {
                code: KeyCode::Delete,
                ..
            } => {
                self.delete_char_forward();
                EditorAction::Continue
            }

            KeyEvent {
                code: KeyCode::Tab, ..
            } => {
                // Insert 4 spaces for tab
                for _ in 0..4 {
                    self.insert_char(' ');
                }
                EditorAction::Continue
            }

            _ => EditorAction::Continue,
        }
    }

    fn insert_char(&mut self, c: char) {
        self.content[self.cursor_y].insert(self.cursor_x, c);
        self.cursor_x += 1;
        self.modified = true;
    }

    fn insert_newline(&mut self) {
        let current_line = &self.content[self.cursor_y];
        let new_line = current_line[self.cursor_x..].to_string();
        self.content[self.cursor_y].truncate(self.cursor_x);
        self.content.insert(self.cursor_y + 1, new_line);
        self.cursor_y += 1;
        self.cursor_x = 0;
        self.modified = true;
    }

    fn delete_char(&mut self) {
        if self.cursor_x > 0 {
            self.content[self.cursor_y].remove(self.cursor_x - 1);
            self.cursor_x -= 1;
            self.modified = true;
        } else if self.cursor_y > 0 {
            let current_line = self.content.remove(self.cursor_y);
            self.cursor_y -= 1;
            self.cursor_x = self.content[self.cursor_y].len();
            self.content[self.cursor_y].push_str(&current_line);
            self.modified = true;
        }
    }

    fn delete_char_forward(&mut self) {
        let current_line_len = self.content[self.cursor_y].len();
        if self.cursor_x < current_line_len {
            self.content[self.cursor_y].remove(self.cursor_x);
            self.modified = true;
        } else if self.cursor_y < self.content.len() - 1 {
            let next_line = self.content.remove(self.cursor_y + 1);
            self.content[self.cursor_y].push_str(&next_line);
            self.modified = true;
        }
    }

    fn adjust_cursor_x(&mut self) {
        let current_line_len = self.content[self.cursor_y].len();
        if self.cursor_x > current_line_len {
            self.cursor_x = current_line_len;
        }
    }

    fn draw_screen(&mut self) -> io::Result<()> {
        let (cols, rows) = terminal::size()?;
        let rows = rows as usize;
        let cols = cols as usize;

        // Clear screen
        execute!(io::stdout(), Clear(ClearType::All))?;

        // Draw content
        let content_rows = rows.saturating_sub(2); // Reserve space for status line
        for row in 0..content_rows {
            let file_row = row + self.scroll_offset;
            execute!(io::stdout(), MoveTo(0, row as u16))?;

            if file_row < self.content.len() {
                let line = &self.content[file_row];
                let display_line = if line.len() > cols {
                    &line[..cols]
                } else {
                    line
                };
                print!("{}", display_line);
            } else {
                execute!(io::stdout(), SetForegroundColor(Color::DarkGrey))?;
                print!("~");
                execute!(io::stdout(), ResetColor)?;
            }
        }

        // Draw status line
        execute!(io::stdout(), MoveTo(0, (rows - 2) as u16))?;
        execute!(io::stdout(), SetForegroundColor(Color::Black))?;
        execute!(io::stdout(), crossterm::style::SetBackgroundColor(Color::White))?;
        
        let file_name = self.file_path.as_deref().unwrap_or("[No Name]");
        let modified_indicator = if self.modified { " [Modified]" } else { "" };
        let position = format!("{}:{}", self.cursor_y + 1, self.cursor_x + 1);
        
        let status_left = format!(" {} {}{}", file_name, modified_indicator, " ".repeat(10));
        let status_right = format!("{} ", position);
        let padding = cols.saturating_sub(status_left.len() + status_right.len());
        
        print!("{}{}{}", status_left, " ".repeat(padding), status_right);
        execute!(io::stdout(), ResetColor)?;

        // Draw message line
        execute!(io::stdout(), MoveTo(0, (rows - 1) as u16))?;
        let message = if self.status_message.len() > cols {
            &self.status_message[..cols]
        } else {
            &self.status_message
        };
        print!("{}", message);

        // Position cursor
        let display_y = self.cursor_y.saturating_sub(self.scroll_offset);
        execute!(io::stdout(), MoveTo(self.cursor_x as u16, display_y as u16))?;

        io::stdout().flush()?;
        Ok(())
    }
}

#[derive(Debug)]
enum EditorAction {
    Continue,
    Save,
    Quit,
    SaveAndQuit,
}
