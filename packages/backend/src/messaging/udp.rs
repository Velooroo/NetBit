//! UDP сервер для легковесных операций
//!
//! UDP используется для операций, не требующих гарантированной доставки
//! (например, статусы онлайн, индикаторы печати и т.д.)

use tokio::net::UdpSocket;
use std::sync::Arc;
use log::{info, debug, error};

use crate::storage::cache::MessageCache;
use super::protocol::{MessagePacket, PacketType};

/// Запускает UDP сервер
pub async fn start_udp_server(
    addr: &str,
    cache: Arc<MessageCache>,
) -> std::io::Result<()> {
    let socket = UdpSocket::bind(addr).await?;
    info!("UDP сервер запущен на {}", addr);

    let mut buffer = vec![0u8; 1024];

    loop {
        let (n, peer_addr) = socket.recv_from(&mut buffer).await?;
        debug!("Получен UDP пакет от {} размером {} байт", peer_addr, n);

        let data = &buffer[..n];
        
        // Парсим пакет
        match MessagePacket::from_bytes(data) {
            Ok(packet) => {
                match packet.packet_type {
                    PacketType::Ping => {
                        // Отвечаем на ping
                        let response = b"pong";
                        if let Err(e) = socket.send_to(response, peer_addr).await {
                            error!("Ошибка отправки pong: {}", e);
                        }
                    }
                    PacketType::Status => {
                        // Обрабатываем обновление статуса пользователя
                        debug!("Получено обновление статуса от {}", peer_addr);
                        // TODO: Реализовать обработку статусов
                    }
                    PacketType::Typing => {
                        // Обрабатываем индикатор печати
                        debug!("Получен индикатор печати от {}", peer_addr);
                        // TODO: Реализовать broadcast индикатора печати другим участникам
                    }
                    _ => {
                        debug!("Неподдерживаемый тип пакета для UDP: {:?}", packet.packet_type);
                    }
                }
            }
            Err(e) => {
                error!("Ошибка парсинга UDP пакета: {}", e);
            }
        }
    }
}
