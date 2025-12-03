//! Ядро системы - работа с базой данных

use sqlx::{postgres::PgPoolOptions, PgPool};
use std::time::Duration;

/// Структура для работы с базой данных
#[derive(Clone)]
pub struct Database {
    pub pool: PgPool,
}

impl Database {
    /// Создает новое подключение к базе данных
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .acquire_timeout(Duration::from_secs(3))
            .connect(database_url)
            .await?;

        Ok(Database { pool })
    }

    /// Получает пул подключений к базе данных
    pub fn get_pool(&self) -> &PgPool {
        &self.pool
    }

    /// Выполняет миграции базы данных
    pub async fn run_migrations(&self) -> Result<(), sqlx::Error> {
        sqlx::migrate!("./migrations").run(&self.pool).await?;
        Ok(())
    }

    /// Проверяет подключение к базе данных
    pub async fn test_connection(&self) -> Result<(), sqlx::Error> {
        sqlx::query("SELECT 1").fetch_one(&self.pool).await?;
        Ok(())
    }
}
