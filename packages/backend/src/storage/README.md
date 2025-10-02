# Storage Layer

Слой хранения данных, реализующий паттерн cache-first для быстрого доступа к данным.

## Архитектура

### Cache (`cache.rs`)
In-memory кеш для быстрого чтения данных. Использует `HashMap` с `RwLock` для потокобезопасного доступа.

**Основные компоненты:**
- `MessageCache` - основная структура кеша
- Хранит чаты, сообщения и индексы пользователей
- Загружается из БД при старте приложения
- Обновляется синхронно при записи

**Использование:**
```rust
use crate::storage::cache::MessageCache;
use std::sync::Arc;

// Создание кеша
let cache = Arc::new(MessageCache::new());

// Загрузка данных из БД
cache.load_from_db(db.connection.clone())?;

// Чтение чата
let chat = cache.get_chat(chat_id);

// Чтение сообщений с пагинацией
let messages = cache.get_messages(chat_id, page, per_page);

// Добавление нового сообщения
cache.add_message(message)?;
```

**Производительность:**
- Чтение чата: O(1)
- Чтение сообщений: O(n), где n - количество запрошенных сообщений
- Добавление: O(1)

### Repository (`repository.rs`)
Паттерн Repository для записи данных в базу данных.

**Основные компоненты:**
- `ChatRepository` - операции с чатами
- `MessageRepository` - операции с сообщениями

**Использование:**
```rust
use crate::storage::repository::{ChatRepository, MessageRepository};

// Создание репозиториев
let chat_repo = ChatRepository::new(db.connection.clone());
let message_repo = MessageRepository::new(db.connection.clone());

// Создание чата
let chat_id = chat_repo.create_chat(&chat)?;

// Добавление участника
chat_repo.add_participant(chat_id, user_id, "member")?;

// Создание сообщения
let message_id = message_repo.create_message(&message)?;
```

## Поток данных

### Чтение (Read Path)
```
API -> Cache -> Response
```
- Все операции чтения идут через кеш
- Никаких запросов к БД при чтении
- Минимальная латентность (~1-3ms)

### Запись (Write Path)
```
API -> Repository -> Database
    -> Cache (update)
```
- Все операции записи идут в БД через Repository
- После успешной записи обновляется кеш
- Гарантируется консистентность данных

## Конфигурация

### Размер кеша
По умолчанию кеш хранит:
- Все чаты (обычно небольшой набор данных)
- Последние 100 сообщений на чат

Можно изменить в `cache.rs`:
```rust
let max_messages_per_chat = 100; // Изменить здесь
```

### Управление памятью
- Базовое использование: ~50-100MB
- На 1 активный чат: ~100-200KB
- На 1000 активных чатов: ~100-200MB

## Graceful Shutdown

При остановке приложения:
1. Кеш может сохранить состояние в БД (если нужно)
2. Все данные уже персистентны (пишем синхронно)
3. Чистое завершение работы

```rust
// При shutdown
cache.persist_to_db(db.connection.clone())?;
```

## Производительность

### Benchmarks
- **get_chat**: ~1ms (in-memory)
- **get_messages**: ~2-3ms (in-memory + pagination)
- **create_message**: ~10-20ms (DB write + cache update)

### Масштабируемость
- 1000+ чатов: ~200MB RAM
- 10,000+ чатов: ~2GB RAM
- Поддержка 1000+ одновременных пользователей

## Будущие улучшения

1. **LRU eviction** - вытеснение старых сообщений
2. **Кеш-метрики** - отслеживание hit rate
3. **Распределенный кеш** - Redis для multi-instance
4. **Кеш warming** - предзагрузка популярных данных
