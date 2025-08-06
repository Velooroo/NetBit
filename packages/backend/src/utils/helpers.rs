//! Вспомогательные функции и утилиты

use std::fs;
use std::path::Path;
use chrono::{DateTime, Utc};
use serde_json::Value;

// ============================================================================
// ФАЙЛОВЫЕ ОПЕРАЦИИ
// ============================================================================

/// Создает директорию если она не существует
pub fn ensure_directory_exists(path: &str) -> Result<(), std::io::Error> {
    if !Path::new(path).exists() {
        fs::create_dir_all(path)?;
    }
    Ok(())
}

/// Проверяет существование файла
pub fn file_exists(path: &str) -> bool {
    Path::new(path).exists()
}

/// Получает размер файла в байтах
pub fn get_file_size(path: &str) -> Result<u64, std::io::Error> {
    let metadata = fs::metadata(path)?;
    Ok(metadata.len())
}

/// Безопасно удаляет файл
pub fn safe_remove_file(path: &str) -> Result<(), std::io::Error> {
    if file_exists(path) {
        fs::remove_file(path)?;
    }
    Ok(())
}

/// Безопасно удаляет директорию
pub fn safe_remove_dir(path: &str) -> Result<(), std::io::Error> {
    if Path::new(path).exists() {
        fs::remove_dir_all(path)?;
    }
    Ok(())
}

// ============================================================================
// СТРОКОВЫЕ ОПЕРАЦИИ
// ============================================================================

/// Очищает строку от небезопасных символов для имен файлов
pub fn sanitize_filename(name: &str) -> String {
    name.chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
            c if c.is_control() => '_',
            c => c,
        })
        .collect::<String>()
        .trim()
        .to_string()
}

/// Проверяет валидность имени пользователя
pub fn is_valid_username(username: &str) -> bool {
    if username.is_empty() || username.len() < 3 || username.len() > 50 {
        return false;
    }
    
    username.chars().all(|c| c.is_alphanumeric() || c == '_' || c == '-')
}

/// Проверяет валидность имени проекта/репозитория
pub fn is_valid_project_name(name: &str) -> bool {
    if name.is_empty() || name.len() < 1 || name.len() > 100 {
        return false;
    }
    
    // Разрешаем буквы, цифры, дефисы, подчеркивания и точки
    name.chars().all(|c| c.is_alphanumeric() || c == '_' || c == '-' || c == '.')
        && !name.starts_with('.')
        && !name.ends_with('.')
}

/// Проверяет валидность email адреса (простая проверка)
pub fn is_valid_email(email: &str) -> bool {
    email.contains('@') && email.contains('.') && email.len() > 5
}

// ============================================================================
// РАБОТА С JSON
// ============================================================================

/// Безопасно парсит JSON строку
pub fn safe_parse_json(json_str: &str) -> Result<Value, String> {
    serde_json::from_str(json_str)
        .map_err(|e| format!("JSON parse error: {}", e))
}

/// Конвертирует объект в JSON строку
pub fn to_json_string<T: serde::Serialize>(obj: &T) -> Result<String, String> {
    serde_json::to_string(obj)
        .map_err(|e| format!("JSON serialize error: {}", e))
}

/// Конвертирует объект в красиво отформатированный JSON
pub fn to_pretty_json<T: serde::Serialize>(obj: &T) -> Result<String, String> {
    serde_json::to_string_pretty(obj)
        .map_err(|e| format!("JSON serialize error: {}", e))
}

// ============================================================================
// РАБОТА С ДАТАМИ
// ============================================================================

/// Получает текущую дату в UTC
pub fn now_utc() -> DateTime<Utc> {
    Utc::now()
}

/// Форматирует дату в ISO 8601 формат
pub fn format_datetime(dt: &DateTime<Utc>) -> String {
    dt.format("%Y-%m-%dT%H:%M:%SZ").to_string()
}

/// Парсит дату из ISO 8601 строки
pub fn parse_datetime(date_str: &str) -> Result<DateTime<Utc>, String> {
    DateTime::parse_from_rfc3339(date_str)
        .map(|dt| dt.with_timezone(&Utc))
        .map_err(|e| format!("Date parse error: {}", e))
}

// ============================================================================
// ГЕНЕРАЦИЯ СЛУЧАЙНЫХ ЗНАЧЕНИЙ
// ============================================================================

/// Генерирует случайную строку заданной длины
pub fn generate_random_string(length: usize) -> String {
    use rand::Rng;
    const CHARSET: &[u8] = b"
        ABCDEFGHIJKLMNOPQRSTUVWXYZ\
        abcdefghijklmnopqrstuvwxyz\
        0123456789
    ";
    let mut rng = rand::thread_rng();
    
    (0..length)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}

/// Генерирует случайный ID
pub fn generate_id() -> String {
    generate_random_string(16)
}

// ============================================================================
// ХЭШИРОВАНИЕ
// ============================================================================

/// Простое хэширование пароля (в продакшене использовать bcrypt)
pub fn hash_password(password: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    
    let mut hasher = DefaultHasher::new();
    password.hash(&mut hasher);
    format!("{:x}", hasher.finish())
}

/// Проверяет пароль против хэша
pub fn verify_password(password: &str, hash: &str) -> bool {
    hash_password(password) == hash
}

// ============================================================================
// КОНВЕРТАЦИЯ РАЗМЕРОВ
// ============================================================================

/// Конвертирует размер в байтах
pub fn format_file_size(size: u64) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB", "TB"];
    let mut size = size as f64;
    let mut unit_index = 0;
    
    while size >= 1024.0 && unit_index < UNITS.len() - 1 {
        size /= 1024.0;
        unit_index += 1;
    }
    
    if unit_index == 0 {
        format!("{} {}", size as u64, UNITS[unit_index])
    } else {
        format!("{:.1} {}", size, UNITS[unit_index])
    }
}

// ============================================================================
// ВАЛИДАЦИЯ
// ============================================================================

/// Проверяет, что строка содержит только безопасные символы
pub fn is_safe_string(s: &str) -> bool {
    s.chars().all(|c| c.is_alphanumeric() || " ._-".contains(c))
}

/// Обрезает строку до максимальной длины
pub fn truncate_string(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len.saturating_sub(3)])
    }
}

/// Проверяет, что порт находится в допустимом диапазоне
pub fn is_valid_port(port: u16) -> bool {
    port > 0 && port <= 65535
}

// ============================================================================
// ТЕСТЫ
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_filename() {
        assert_eq!(sanitize_filename("hello/world"), "hello_world");
        assert_eq!(sanitize_filename("test:file"), "test_file");
    }

    #[test]
    fn test_is_valid_username() {
        assert!(is_valid_username("user123"));
        assert!(is_valid_username("test_user"));
        assert!(!is_valid_username("ab")); // слишком короткий
        assert!(!is_valid_username("user@domain")); // недопустимый символ
    }

    #[test]
    fn test_format_file_size() {
        assert_eq!(format_file_size(1024), "1.0 KB");
        assert_eq!(format_file_size(1048576), "1.0 MB");
        assert_eq!(format_file_size(500), "500 B");
    }
}
