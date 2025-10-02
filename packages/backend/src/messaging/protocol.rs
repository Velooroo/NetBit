//! Протокол для обмена сообщениями через TCP/UDP
//!
//! Определяет структуру пакетов и методы сериализации/десериализации.

use serde::{Serialize, Deserialize};
use crate::domain::chat::Message;

/// Типы пакетов в messaging протоколе
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PacketType {
    /// Отправка сообщения (TCP)
    SendMessage,
    /// Получение сообщений (TCP)
    GetMessages,
    /// Подтверждение доставки (TCP ACK)
    Ack,
    /// Ping для проверки соединения (UDP)
    Ping,
    /// Обновление статуса пользователя (UDP)
    Status,
    /// Индикатор печати (UDP)
    Typing,
}

/// Основной пакет для передачи данных
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessagePacket {
    /// Тип пакета
    pub packet_type: PacketType,
    /// Сообщение (для SendMessage)
    pub message: Option<Message>,
    /// ID чата (для GetMessages)
    pub chat_id: Option<i64>,
    /// Страница (для GetMessages)
    pub page: Option<u32>,
    /// Количество сообщений на странице (для GetMessages)
    pub per_page: Option<u32>,
    /// ID пользователя (для Status, Typing)
    pub user_id: Option<i64>,
    /// Данные статуса (для Status)
    pub status_data: Option<String>,
}

impl MessagePacket {
    /// Создает пакет для отправки сообщения
    pub fn send_message(message: Message) -> Self {
        Self {
            packet_type: PacketType::SendMessage,
            message: Some(message),
            chat_id: None,
            page: None,
            per_page: None,
            user_id: None,
            status_data: None,
        }
    }

    /// Создает пакет для получения сообщений
    pub fn get_messages(chat_id: i64, page: u32, per_page: u32) -> Self {
        Self {
            packet_type: PacketType::GetMessages,
            message: None,
            chat_id: Some(chat_id),
            page: Some(page),
            per_page: Some(per_page),
            user_id: None,
            status_data: None,
        }
    }

    /// Создает пакет ping
    pub fn ping() -> Self {
        Self {
            packet_type: PacketType::Ping,
            message: None,
            chat_id: None,
            page: None,
            per_page: None,
            user_id: None,
            status_data: None,
        }
    }

    /// Создает пакет обновления статуса
    pub fn status(user_id: i64, status: String) -> Self {
        Self {
            packet_type: PacketType::Status,
            message: None,
            chat_id: None,
            page: None,
            per_page: None,
            user_id: Some(user_id),
            status_data: Some(status),
        }
    }

    /// Создает пакет индикатора печати
    pub fn typing(user_id: i64, chat_id: i64) -> Self {
        Self {
            packet_type: PacketType::Typing,
            message: None,
            chat_id: Some(chat_id),
            page: None,
            per_page: None,
            user_id: Some(user_id),
            status_data: None,
        }
    }

    /// Сериализует пакет в байты
    pub fn to_bytes(&self) -> Result<Vec<u8>, String> {
        serde_json::to_vec(self).map_err(|e| format!("Ошибка сериализации: {}", e))
    }

    /// Десериализует пакет из байт
    pub fn from_bytes(data: &[u8]) -> Result<Self, String> {
        serde_json::from_slice(data).map_err(|e| format!("Ошибка десериализации: {}", e))
    }
}

/// Пакет подтверждения доставки (ACK)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AckPacket {
    /// ID сообщения, которое было доставлено
    pub message_id: i64,
    /// Успешность операции
    pub success: bool,
    /// Ошибка (если есть)
    pub error: Option<String>,
}

impl AckPacket {
    /// Создает успешный ACK
    pub fn success(message_id: i64) -> Self {
        Self {
            message_id,
            success: true,
            error: None,
        }
    }

    /// Создает ACK с ошибкой
    pub fn error(message_id: i64, error: String) -> Self {
        Self {
            message_id,
            success: false,
            error: Some(error),
        }
    }

    /// Сериализует пакет в байты
    pub fn to_bytes(&self) -> Result<Vec<u8>, String> {
        serde_json::to_vec(self).map_err(|e| format!("Ошибка сериализации ACK: {}", e))
    }

    /// Десериализует пакет из байт
    pub fn from_bytes(data: &[u8]) -> Result<Self, String> {
        serde_json::from_slice(data).map_err(|e| format!("Ошибка десериализации ACK: {}", e))
    }
}
