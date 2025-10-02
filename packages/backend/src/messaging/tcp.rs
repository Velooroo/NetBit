//! TCP сервер для гарантированной доставки сообщений
//!
//! TCP обеспечивает надежную доставку сообщений с подтверждением получения.

use tokio::net::{TcpListener, TcpStream};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use std::sync::Arc;
use log::{info, debug, error};

use crate::storage::cache::MessageCache;
use crate::storage::repository::MessageRepository;
use crate::core::database::Database;
use crate::domain::chat::{Message, MessageType};
use super::protocol::{MessagePacket, PacketType, AckPacket};

/// Запускает TCP сервер для обработки сообщений
pub async fn start_tcp_server(
    addr: &str,
    cache: Arc<MessageCache>,
    database: Arc<Database>,
) -> std::io::Result<()> {
    let listener = TcpListener::bind(addr).await?;
    info!("TCP сервер запущен на {}", addr);

    loop {
        let (stream, peer_addr) = listener.accept().await?;
        debug!("Новое TCP подключение от {}", peer_addr);

        let cache_clone = cache.clone();
        let database_clone = database.clone();

        tokio::spawn(async move {
            if let Err(e) = handle_tcp_connection(stream, cache_clone, database_clone).await {
                error!("Ошибка обработки TCP подключения от {}: {}", peer_addr, e);
            }
        });
    }
}

/// Обрабатывает TCP подключение
async fn handle_tcp_connection(
    mut stream: TcpStream,
    cache: Arc<MessageCache>,
    database: Arc<Database>,
) -> std::io::Result<()> {
    let mut buffer = vec![0u8; 4096];

    loop {
        let n = stream.read(&mut buffer).await?;
        
        if n == 0 {
            // Подключение закрыто
            return Ok(());
        }

        let data = &buffer[..n];
        
        // Парсим пакет
        match MessagePacket::from_bytes(data) {
            Ok(packet) => {
                debug!("Получен пакет типа {:?}", packet.packet_type);
                
                match packet.packet_type {
                    PacketType::SendMessage => {
                        // Обрабатываем отправку сообщения
                        if let Some(message) = packet.message {
                            // Записываем в БД
                            let repo = MessageRepository::new(database.connection.clone());
                            match repo.create_message(&message) {
                                Ok(message_id) => {
                                    // Добавляем в кеш
                                    let mut msg_with_id = message.clone();
                                    msg_with_id.id = Some(message_id);
                                    
                                    if let Err(e) = cache.add_message(msg_with_id) {
                                        error!("Ошибка добавления сообщения в кеш: {}", e);
                                    }
                                    
                                    // Отправляем ACK
                                    let ack = AckPacket {
                                        message_id,
                                        success: true,
                                        error: None,
                                    };
                                    
                                    if let Ok(ack_bytes) = ack.to_bytes() {
                                        if let Err(e) = stream.write_all(&ack_bytes).await {
                                            error!("Ошибка отправки ACK: {}", e);
                                        }
                                    }
                                    
                                    debug!("Сообщение {} успешно сохранено и подтверждено", message_id);
                                }
                                Err(e) => {
                                    error!("Ошибка сохранения сообщения в БД: {}", e);
                                    
                                    // Отправляем ACK с ошибкой
                                    let ack = AckPacket {
                                        message_id: 0,
                                        success: false,
                                        error: Some(format!("Ошибка БД: {}", e)),
                                    };
                                    
                                    if let Ok(ack_bytes) = ack.to_bytes() {
                                        let _ = stream.write_all(&ack_bytes).await;
                                    }
                                }
                            }
                        }
                    }
                    PacketType::GetMessages => {
                        // Обрабатываем запрос сообщений из кеша
                        if let (Some(chat_id), Some(page), Some(per_page)) = 
                            (packet.chat_id, packet.page, packet.per_page) {
                            
                            let messages = cache.get_messages(chat_id, page, per_page);
                            debug!("Получено {} сообщений из кеша для чата {}", messages.len(), chat_id);
                            
                            // Отправляем сообщения обратно
                            // TODO: Реализовать сериализацию и отправку списка сообщений
                        }
                    }
                    _ => {
                        debug!("Неизвестный тип пакета");
                    }
                }
            }
            Err(e) => {
                error!("Ошибка парсинга пакета: {}", e);
            }
        }
    }
}
