//! Ядро системы - конфигурация приложения

use std::env;
use crate::core::types::ServerConfig;

// ============================================================================
// КОНСТАНТЫ ПО УМОЛЧАНИЮ
// ============================================================================

const DEFAULT_HOST: &str = "0.0.0.0";
const DEFAULT_PORT: u16 = 8000;
const DEFAULT_DATABASE_URL: &str = "postgresql://postgres:postgres@localhost/netbit";
const DEFAULT_JWT_SECRET: &str = "your-secret-key-change-in-production";
const DEFAULT_REPOSITORIES_PATH: &str = "repositories";

// ============================================================================
// ФУНКЦИИ КОНФИГУРАЦИИ
// ============================================================================

/// Загружает конфигурацию из переменных окружения или использует значения по умолчанию
/// Сначала пытается загрузить .env файл, если он существует
pub fn load_config() -> ServerConfig {
    // Пытаемся загрузить .env файл (игнорируем ошибку если файл не найден)
    let _ = dotenvy::dotenv();
    
    ServerConfig {
        host: env::var("HOST").unwrap_or_else(|_| DEFAULT_HOST.to_string()),
        port: env::var("PORT")
            .unwrap_or_else(|_| DEFAULT_PORT.to_string())
            .parse()
            .unwrap_or(DEFAULT_PORT),
        database_url: env::var("DATABASE_URL").unwrap_or_else(|_| DEFAULT_DATABASE_URL.to_string()),
        jwt_secret: env::var("JWT_SECRET").unwrap_or_else(|_| DEFAULT_JWT_SECRET.to_string()),
        repositories_path: env::var("REPOSITORIES_PATH").unwrap_or_else(|_| DEFAULT_REPOSITORIES_PATH.to_string()),
    }
}

/// Проверяет корректность конфигурации
pub fn validate_config(config: &ServerConfig) -> Result<(), String> {
    if config.host.is_empty() {
        return Err("Host cannot be empty".to_string());
    }

    if config.port == 0 {
        return Err("Port must be greater than 0".to_string());
    }

    if config.database_url.is_empty() {
        return Err("Database URL cannot be empty".to_string());
    }

    if config.jwt_secret.is_empty() {
        return Err("JWT secret cannot be empty".to_string());
    }

    if config.jwt_secret == DEFAULT_JWT_SECRET {
        eprintln!("WARNING: Using default JWT secret. Please set JWT_SECRET environment variable in production!");
    }

    if config.repositories_path.is_empty() {
        return Err("Repositories path cannot be empty".to_string());
    }

    Ok(())
}

/// Выводит текущую конфигурацию (без секретных данных)
pub fn print_config(config: &ServerConfig) {
    println!("Server Configuration:");
    println!("  Host: {}", config.host);
    println!("  Port: {}", config.port);
    println!("  Database URL: {}", config.database_url);
    println!("  JWT Secret: [HIDDEN]");
    println!("  Repositories Path: {}", config.repositories_path);
}

/// Создает конфигурацию для разработки
pub fn dev_config() -> ServerConfig {
    ServerConfig {
        host: "127.0.0.1".to_string(),
        port: 8000,
        database_url: "gitea.db".to_string(),
        jwt_secret: "dev-secret-key-not-for-production".to_string(),
        repositories_path: "repositories".to_string(),
    }
}

/// Создает конфигурацию для тестирования
pub fn test_config() -> ServerConfig {
    ServerConfig {
        host: "127.0.0.1".to_string(),
        port: 0, // Случайный порт для тестов
        database_url: "postgresql://postgres:postgres@localhost/netbit_test".to_string(),
        jwt_secret: "test-secret-key".to_string(),
        repositories_path: "test_repositories".to_string(),
    }
}
