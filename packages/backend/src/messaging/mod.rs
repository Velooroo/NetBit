//! Messaging layer - TCP/UDP протокол для обмена сообщениями
//!
//! TCP используется как основной протокол для гарантированной доставки сообщений.
//! UDP может использоваться для легковесных операций (статусы, presence и т.д.)

pub mod tcp;
pub mod udp;
pub mod protocol;

use std::sync::Arc;
use log::info;

use crate::storage::cache::MessageCache;
use crate::core::database::Database;

/// Конфигурация для messaging сервера
#[derive(Clone)]
pub struct MessagingConfig {
    pub tcp_host: String,
    pub tcp_port: u16,
    pub udp_host: String,
    pub udp_port: u16,
}

impl Default for MessagingConfig {
    fn default() -> Self {
        Self {
            tcp_host: "127.0.0.1".to_string(),
            tcp_port: 8081,
            udp_host: "127.0.0.1".to_string(),
            udp_port: 8082,
        }
    }
}

/// Messaging сервер (TCP + UDP)
pub struct MessagingServer {
    config: MessagingConfig,
    cache: Arc<MessageCache>,
    database: Arc<Database>,
}

impl MessagingServer {
    pub fn new(config: MessagingConfig, cache: Arc<MessageCache>, database: Arc<Database>) -> Self {
        Self {
            config,
            cache,
            database,
        }
    }

    /// Запускает messaging серверы (TCP и UDP)
    pub async fn start(&self) -> std::io::Result<()> {
        info!("Запуск messaging сервера...");
        
        let tcp_addr = format!("{}:{}", self.config.tcp_host, self.config.tcp_port);
        let udp_addr = format!("{}:{}", self.config.udp_host, self.config.udp_port);
        
        info!("TCP сервер будет запущен на {}", tcp_addr);
        info!("UDP сервер будет запущен на {}", udp_addr);
        
        // Запускаем TCP сервер в отдельной задаче
        let tcp_cache = self.cache.clone();
        let tcp_database = self.database.clone();
        let tcp_addr_clone = tcp_addr.clone();
        
        tokio::spawn(async move {
            if let Err(e) = tcp::start_tcp_server(&tcp_addr_clone, tcp_cache, tcp_database).await {
                eprintln!("Ошибка TCP сервера: {}", e);
            }
        });
        
        // Запускаем UDP сервер в отдельной задаче
        let udp_cache = self.cache.clone();
        let udp_addr_clone = udp_addr.clone();
        
        tokio::spawn(async move {
            if let Err(e) = udp::start_udp_server(&udp_addr_clone, udp_cache).await {
                eprintln!("Ошибка UDP сервера: {}", e);
            }
        });
        
        info!("Messaging серверы запущены");
        
        Ok(())
    }
}
