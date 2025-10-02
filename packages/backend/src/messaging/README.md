# Messaging Layer

Слой обмена сообщениями в реальном времени через TCP/UDP протоколы.

## Архитектура

### TCP Server (`tcp.rs`)
TCP сервер для надежной доставки сообщений с подтверждением.

**Особенности:**
- Connection-oriented протокол
- Гарантия доставки сообщений
- Система подтверждений (ACK/NACK)
- Порт: 8081 (по умолчанию)

**Обрабатываемые операции:**
- `SendMessage` - отправка сообщения
- `GetMessages` - получение сообщений из кеша

**Поток обработки:**
```
Client -> TCP Connect
Client -> Send MessagePacket (SendMessage)
Server -> Write to Database
Server -> Update Cache
Server -> Send AckPacket (success + message_id)
Client -> Receive Confirmation
```

### UDP Server (`udp.rs`)
UDP сервер для легковесных операций без гарантии доставки.

**Особенности:**
- Connectionless протокол
- Best-effort delivery
- Минимальная латентность
- Порт: 8082 (по умолчанию)

**Обрабатываемые операции:**
- `Ping` - проверка соединения
- `Status` - обновление статуса пользователя (онлайн/оффлайн)
- `Typing` - индикатор печати

**Поток обработки:**
```
Client -> UDP Packet (Ping/Status/Typing)
Server -> Process Packet
Server -> (Optional) Broadcast to other clients
```

### Protocol (`protocol.rs`)
Определения протокола обмена данными.

**Типы пакетов:**
```rust
pub enum PacketType {
    SendMessage,  // Отправка сообщения (TCP)
    GetMessages,  // Получение сообщений (TCP)
    Ack,         // Подтверждение (TCP)
    Ping,        // Проверка связи (UDP)
    Status,      // Статус пользователя (UDP)
    Typing,      // Индикатор печати (UDP)
}
```

**Структура пакета:**
```rust
pub struct MessagePacket {
    pub packet_type: PacketType,
    pub message: Option<Message>,
    pub chat_id: Option<i64>,
    pub page: Option<u32>,
    pub per_page: Option<u32>,
    pub user_id: Option<i64>,
    pub status_data: Option<String>,
}
```

**Пакет подтверждения:**
```rust
pub struct AckPacket {
    pub message_id: i64,
    pub success: bool,
    pub error: Option<String>,
}
```

## Использование

### Запуск серверов

В `main.rs`:
```rust
use messaging::{MessagingServer, MessagingConfig};

// Создание конфигурации
let config = MessagingConfig {
    tcp_host: "0.0.0.0".to_string(),
    tcp_port: 8081,
    udp_host: "0.0.0.0".to_string(),
    udp_port: 8082,
};

// Создание и запуск сервера
let server = MessagingServer::new(config, cache, database);
tokio::spawn(async move {
    server.start().await.expect("Failed to start messaging server");
});
```

### Отправка сообщения через TCP

**Клиент (пример на Rust):**
```rust
use tokio::net::TcpStream;
use tokio::io::{AsyncWriteExt, AsyncReadExt};

// Подключение
let mut stream = TcpStream::connect("127.0.0.1:8081").await?;

// Создание пакета
let packet = MessagePacket::send_message(message);
let data = packet.to_bytes()?;

// Отправка
stream.write_all(&data).await?;

// Получение подтверждения
let mut buffer = vec![0u8; 1024];
let n = stream.read(&mut buffer).await?;
let ack = AckPacket::from_bytes(&buffer[..n])?;

if ack.success {
    println!("Message sent! ID: {}", ack.message_id);
}
```

### Отправка статуса через UDP

**Клиент (пример на Rust):**
```rust
use tokio::net::UdpSocket;

// Создание сокета
let socket = UdpSocket::bind("0.0.0.0:0").await?;

// Создание пакета
let packet = MessagePacket::status(user_id, "online".to_string());
let data = packet.to_bytes()?;

// Отправка
socket.send_to(&data, "127.0.0.1:8082").await?;
```

## Производительность

### TCP
- **Latency**: ~5-15ms (включая ACK)
- **Throughput**: ~1000 messages/sec на соединение
- **Concurrent connections**: 1000+

### UDP
- **Latency**: ~1-2ms
- **Throughput**: ~10,000 packets/sec
- **No connection overhead**

## Безопасность

### Текущая реализация
- Базовая валидация пакетов
- JSON сериализация

### Планы на будущее
1. **Аутентификация** - токены для TCP соединений
2. **Шифрование** - TLS для TCP, DTLS для UDP
3. **Rate limiting** - защита от флуда
4. **Message signing** - проверка целостности

## Интеграция с HTTP API

Messaging работает параллельно с HTTP API:
- **HTTP API**: CRUD операции, REST endpoints
- **TCP**: Real-time сообщения с гарантией доставки
- **UDP**: Легковесные обновления статуса

Оба используют общий кеш и базу данных.

## Мониторинг

### Метрики для отслеживания
- Количество активных TCP соединений
- UDP packets/sec
- ACK success rate
- Average message latency
- Error rate

### Логирование
```rust
debug!("Получен пакет типа {:?}", packet.packet_type);
info!("TCP сервер запущен на {}", addr);
error!("Ошибка обработки TCP подключения: {}", e);
```

## Troubleshooting

### TCP соединения не устанавливаются
1. Проверить порт: `netstat -an | grep 8081`
2. Проверить firewall: `sudo ufw status`
3. Проверить логи: `tail -f app.log`

### UDP пакеты не доставляются
1. UDP не гарантирует доставку - это нормально
2. Проверить размер пакетов (макс ~1500 bytes)
3. Проверить сетевые настройки

### ACK не приходит
1. Проверить таймаут на клиенте
2. Проверить логи сервера на ошибки
3. Проверить формат пакета

## Примеры использования

### TypeScript/JavaScript клиент (TCP)
```typescript
import net from 'net';

const client = net.connect(8081, '127.0.0.1', () => {
  const packet = {
    packet_type: 'SendMessage',
    message: {
      chat_id: 1,
      sender_id: 1,
      content: 'Hello!',
      message_type: 'Text'
    }
  };
  
  client.write(JSON.stringify(packet));
});

client.on('data', (data) => {
  const ack = JSON.parse(data.toString());
  console.log('Message ID:', ack.message_id);
});
```

### Python клиент (UDP)
```python
import socket
import json

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

packet = {
    'packet_type': 'Status',
    'user_id': 1,
    'status_data': 'online'
}

sock.sendto(json.dumps(packet).encode(), ('127.0.0.1', 8082))
```

## Будущие улучшения

1. **WebSocket support** - для браузерных клиентов
2. **Message broadcast** - рассылка в группы
3. **Presence tracking** - отслеживание онлайн статуса
4. **Message queue** - для offline сообщений
5. **Compression** - сжатие больших сообщений
6. **Binary protocol** - более эффективная сериализация
