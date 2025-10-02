# Examples

Примеры использования TCP/UDP messaging серверов.

## Запуск примеров

### 1. Запустите backend сервер

```bash
cd packages/backend
RUST_LOG=debug cargo run
```

Сервер запустится на:
- HTTP API: `http://localhost:8080`
- TCP Messaging: `tcp://localhost:8081`
- UDP Messaging: `udp://localhost:8082`

### 2. Запустите примеры

#### TCP Client
```bash
cargo run --example tcp_client
```

Этот пример:
- Подключается к TCP серверу
- Отправляет сообщение в чат
- Получает подтверждение (ACK) с ID сообщения

#### UDP Client
```bash
cargo run --example udp_client
```

Этот пример:
- Отправляет ping пакет
- Отправляет обновление статуса пользователя
- Отправляет индикатор печати

## Примеры на других языках

### JavaScript/TypeScript (TCP)

```javascript
const net = require('net');

const client = net.connect(8081, '127.0.0.1', () => {
  console.log('Connected to TCP server');
  
  const packet = {
    packet_type: 'SendMessage',
    message: {
      chat_id: 1,
      sender_id: 1,
      content: 'Hello from Node.js!',
      message_type: 'Text'
    }
  };
  
  client.write(JSON.stringify(packet));
});

client.on('data', (data) => {
  const ack = JSON.parse(data.toString());
  console.log('ACK received:', ack);
  client.end();
});

client.on('error', (err) => {
  console.error('Error:', err);
});
```

### Python (UDP)

```python
import socket
import json

# Create UDP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# Send ping
ping_packet = {
    'packet_type': 'Ping'
}
sock.sendto(json.dumps(ping_packet).encode(), ('127.0.0.1', 8082))

# Wait for pong
try:
    data, addr = sock.recvfrom(1024)
    print(f'Received: {data.decode()} from {addr}')
except socket.timeout:
    print('No response')

# Send status update
status_packet = {
    'packet_type': 'Status',
    'user_id': 1,
    'status_data': 'online'
}
sock.sendto(json.dumps(status_packet).encode(), ('127.0.0.1', 8082))

sock.close()
```

### curl (HTTP API для сравнения)

```bash
# Get chats
curl http://localhost:8080/api/chats

# Get messages
curl http://localhost:8080/api/chats/1/messages

# Send message (HTTP)
curl -X POST http://localhost:8080/api/chats/1/messages \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello!", "message_type": "text"}'
```

## Protocol Reference

### TCP Packets

#### SendMessage
```json
{
  "packet_type": "SendMessage",
  "message": {
    "chat_id": 1,
    "sender_id": 1,
    "content": "Hello!",
    "message_type": "Text"
  }
}
```

#### GetMessages
```json
{
  "packet_type": "GetMessages",
  "chat_id": 1,
  "page": 1,
  "per_page": 50
}
```

#### ACK Response
```json
{
  "message_id": 123,
  "success": true,
  "error": null
}
```

### UDP Packets

#### Ping
```json
{
  "packet_type": "Ping"
}
```

Response: `"pong"`

#### Status
```json
{
  "packet_type": "Status",
  "user_id": 1,
  "status_data": "online"
}
```

#### Typing
```json
{
  "packet_type": "Typing",
  "chat_id": 1,
  "user_id": 1
}
```

## Testing with netcat

### TCP
```bash
# Send ping via TCP
echo '{"packet_type":"Ping"}' | nc localhost 8081

# Send message via TCP
echo '{"packet_type":"SendMessage","message":{"chat_id":1,"sender_id":1,"content":"Test","message_type":"Text"}}' | nc localhost 8081
```

### UDP
```bash
# Send ping via UDP
echo '{"packet_type":"Ping"}' | nc -u localhost 8082

# Send status via UDP
echo '{"packet_type":"Status","user_id":1,"status_data":"online"}' | nc -u localhost 8082
```

## Troubleshooting

### Connection refused
- Убедитесь, что сервер запущен: `ps aux | grep git-server-backend`
- Проверьте порты: `netstat -an | grep 808[0-2]`
- Проверьте firewall: `sudo ufw status`

### ACK не приходит (TCP)
- Проверьте логи сервера: `RUST_LOG=debug cargo run`
- Убедитесь, что пакет валиден (JSON)
- Проверьте таймаут на клиенте

### UDP пакеты не доставляются
- UDP не гарантирует доставку - это нормально
- Проверьте размер пакета (макс ~1500 bytes)
- Попробуйте увеличить таймаут на клиенте

## Next Steps

1. **Интегрируйте** TCP/UDP клиент в ваше приложение
2. **Тестируйте** производительность под нагрузкой
3. **Мониторьте** метрики (подключения, задержки, ошибки)
4. **Документируйте** ваши use cases

## Resources

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Полная документация архитектуры
- [storage/README.md](../src/storage/README.md) - Документация по кешу
- [messaging/README.md](../src/messaging/README.md) - Документация по messaging
- [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) - Руководство по миграции
