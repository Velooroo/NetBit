# Spark - Package Management & Remote Execution System

## Общее описание

Spark - система управления пакетами и удаленного выполнения для Netbit. Позволяет пользователям:
- Загружать проекты в реестр пакетов
- Устанавливать пакеты на локальные машины
- Запускать приложения как "remote units"
- Мониторить состояние и получать телеметрию

---

## 1. Database Schema

### 1.1 spark_packages - Реестр пакетов

| Поле | Тип | Описание | Обязательное |
|------|-----|----------|--------------|
| id | BIGSERIAL | Уникальный ID | ✓ |
| name | TEXT | Уникальное имя пакета (например "sipd") | ✓ |
| display_name | TEXT | Отображаемое имя | ✓ |
| description | TEXT | Описание пакета | ✗ |
| author_id | BIGINT | ID автора (FK users) | ✓ |
| project_id | BIGINT | Связь с проектом (FK projects) | ✗ |
| repository | TEXT | Git repository URL | ✗ |
| category | TEXT | Категория (биомедицина, фотоника и т.д.) | ✗ |
| is_public | BOOLEAN | Публичный доступ | ✓ |
| downloads | BIGINT | Счетчик загрузок | ✓ (default 0) |
| created_at | TIMESTAMPTZ | Дата создания | ✓ |
| updated_at | TIMESTAMPTZ | Дата обновления | ✓ |

**Индексы**: name, category, author_id

---

### 1.2 spark_package_versions - Версии пакетов

| Поле | Тип | Описание | Обязательное |
|------|-----|----------|--------------|
| id | BIGSERIAL | Уникальный ID | ✓ |
| package_id | BIGINT | ID пакета (FK spark_packages) | ✓ |
| version | TEXT | Версия (semver: "1.0.0") | ✓ |
| changelog | TEXT | Список изменений | ✗ |
| download_url | TEXT | URL для скачивания | ✗ |
| checksum | TEXT | SHA256 checksum файла | ✗ |
| size_bytes | BIGINT | Размер в байтах | ✗ |
| is_stable | BOOLEAN | Стабильная версия | ✓ (default true) |
| created_at | TIMESTAMPTZ | Дата публикации | ✓ |

**Unique**: (package_id, version)
**Индексы**: package_id

---

### 1.3 spark_remote_units - Запущенные экземпляры

| Поле | Тип | Описание | Обязательное |
|------|-----|----------|--------------|
| id | BIGSERIAL | Уникальный ID | ✓ |
| unit_id | UUID | UUID для внешнего доступа | ✓ (auto) |
| name | TEXT | Имя экземпляра | ✓ |
| package_id | BIGINT | ID пакета | ✓ |
| package_version_id | BIGINT | ID версии пакета | ✓ |
| owner_id | BIGINT | ID владельца (FK users) | ✓ |
| device_name | TEXT | Имя устройства (hostname) | ✗ |
| device_os | TEXT | ОС (linux/macos/windows) | ✗ |
| status | TEXT | starting/running/stopped/failed/paused | ✓ |
| pid | INTEGER | Process ID на устройстве | ✗ |
| port | INTEGER | Порт (если слушает) | ✗ |
| started_at | TIMESTAMPTZ | Время запуска | ✗ |
| stopped_at | TIMESTAMPTZ | Время остановки | ✗ |
| last_heartbeat | TIMESTAMPTZ | Последний heartbeat | ✗ |
| created_at | TIMESTAMPTZ | Время создания | ✓ |

**Индексы**: unit_id, owner_id, status

---

### 1.4 spark_unit_telemetry - Телеметрия и логи

| Поле | Тип | Описание | Обязательное |
|------|-----|----------|--------------|
| id | BIGSERIAL | Уникальный ID | ✓ |
| unit_id | UUID | UUID юнита (FK spark_remote_units) | ✓ |
| telemetry_type | TEXT | log/metric/event/error | ✓ |
| level | TEXT | debug/info/warn/error/fatal | ✗ |
| message | TEXT | Текстовое сообщение | ✗ |
| data | JSONB | Структурированные данные | ✗ |
| timestamp | TIMESTAMPTZ | Время события | ✓ |

**Индексы**: unit_id, timestamp, telemetry_type

---

### 1.5 spark_user_installations - Установленные пакеты

| Поле | Тип | Описание | Обязательное |
|------|-----|----------|--------------|
| id | BIGSERIAL | Уникальный ID | ✓ |
| user_id | BIGINT | ID пользователя | ✓ |
| package_id | BIGINT | ID пакета | ✓ |
| package_version_id | BIGINT | ID версии | ✓ |
| install_path | TEXT | Путь установки | ✗ |
| installed_at | TIMESTAMPTZ | Время установки | ✓ |

**Unique**: (user_id, package_id)
**Индексы**: user_id

---

### 1.6 spark_package_tags - Теги пакетов

| Поле | Тип | Описание | Обязательное |
|------|-----|----------|--------------|
| id | BIGSERIAL | Уникальный ID | ✓ |
| package_id | BIGINT | ID пакета | ✓ |
| tag | TEXT | Тег (ML, Python, Rust и т.д.) | ✓ |

**Unique**: (package_id, tag)

---

## 2. REST API Endpoints

### 2.1 Package Management

| Метод | Путь | Описание | Auth | Body/Query |
|-------|------|----------|------|------------|
| GET | `/api/spark/packages` | Список публичных пакетов | ✗ | ?limit=20&offset=0 |
| GET | `/api/spark/packages/search` | Поиск пакетов | ✗ | ?q=query&limit=20 |
| GET | `/api/spark/packages/{name}` | Информация о пакете | ✗ | - |
| POST | `/api/spark/packages` | Создать пакет | ✓ | CreatePackageRequest |
| POST | `/api/spark/packages/{name}/versions` | Добавить версию | ✓ | CreateVersionRequest |
| POST | `/api/spark/packages/install` | Установить пакет | ✓ | InstallRequest |

**CreatePackageRequest**:
```json
{
  "name": "sipd",
  "display_name": "SIPD Server",
  "description": "Signal processing daemon",
  "repository": "https://github.com/user/sipd",
  "category": "Биомедицина",
  "is_public": true
}
```

**CreateVersionRequest**:
```json
{
  "version": "1.0.0",
  "changelog": "Initial release",
  "download_url": "https://cdn.netbit.io/sipd-1.0.0.tar.gz",
  "is_stable": true
}
```

**InstallRequest**:
```json
{
  "package_name": "sipd",
  "version": null
}
```

---

### 2.2 Remote Unit Management

| Метод | Путь | Описание | Auth | Body/Query |
|-------|------|----------|------|------------|
| POST | `/api/spark/units` | Создать unit | ✓ | CreateUnitRequest |
| GET | `/api/spark/units` | Список units пользователя | ✓ | - |
| GET | `/api/spark/units/{unit_id}` | Детали unit | ✓ | - |
| PUT | `/api/spark/units/{unit_id}/status` | Обновить статус | ✓ | UpdateStatusRequest |
| POST | `/api/spark/units/{unit_id}/heartbeat` | Отправить heartbeat | ✓ | - |
| DELETE | `/api/spark/units/{unit_id}` | Удалить unit | ✓ | - |

**CreateUnitRequest**:
```json
{
  "name": "sipd-instance-1",
  "package_name": "sipd",
  "device_name": "macbook-pro.local",
  "device_os": "macos"
}
```

**UpdateStatusRequest**:
```json
{
  "status": "running",
  "pid": 12345,
  "port": 8080
}
```

**Status values**: `starting`, `running`, `stopped`, `failed`, `paused`

---

### 2.3 Telemetry

| Метод | Путь | Описание | Auth | Body/Query |
|-------|------|----------|------|------------|
| POST | `/api/spark/units/{unit_id}/telemetry` | Отправить телеметрию | ✓ | TelemetryRequest |
| GET | `/api/spark/units/{unit_id}/telemetry` | Запрос телеметрии | ✓ | Query params |
| GET | `/api/spark/units/{unit_id}/logs` | Получить логи | ✓ | ?limit=100 |
| GET | `/api/spark/units/{unit_id}/metrics` | Получить метрики | ✓ | ?from=&to= |

**TelemetryRequest**:
```json
{
  "telemetry_type": "log",
  "level": "info",
  "message": "Application started",
  "data": {
    "version": "1.0.0",
    "custom_field": "value"
  }
}
```

**Telemetry Types**: `log`, `metric`, `event`, `error`
**Log Levels**: `debug`, `info`, `warn`, `error`, `fatal`

---

## 3. Client Components

### 3.1 SparkApiClient
HTTP клиент для взаимодействия с API

**Методы**:
- `list_packages()` → Vec<PackageInfo>
- `search_packages(query)` → Vec<PackageInfo>
- `get_package(name)` → (PackageInfo, Vec<PackageVersion>)
- `install_package(name)` → (PackageInfo, PackageVersion)
- `create_unit(req)` → RemoteUnit
- `list_units()` → Vec<RemoteUnit>
- `update_unit_status(unit_id, req)` → ()
- `send_heartbeat(unit_id)` → ()
- `delete_unit(unit_id)` → ()
- `send_telemetry(unit_id, req)` → ()

---

### 3.2 PackageManager
Управление локальными пакетами

**Методы**:
- `init()` → Result - инициализация директории
- `install(package_name)` → InstalledPackage - установка пакета
- `search(query)` → Vec<PackageInfo> - поиск в реестре
- `list_available()` → Vec<PackageInfo> - все доступные
- `list_installed()` → Vec<InstalledPackage> - установленные
- `get_package_path(name)` → Option<PathBuf> - путь к пакету
- `is_installed(name)` → bool - проверка установки
- `uninstall(name)` → Result - удаление
- `get_info(name)` → (PackageInfo, Vec<Version>) - полная информация

**Хранение**: `~/.netbit/spark/packages/{package_name}/`
**Метаданные**: `package.json` в директории пакета

---

### 3.3 ProcessManager
Управление запущенными процессами

**Методы**:
- `start(package, unit_name, command, args)` → ManagedProcess
- `stop(unit_id)` → Result
- `list()` → Vec<ManagedProcess>
- `get(unit_id)` → Option<ManagedProcess>
- `check_status(unit_id)` → String
- `cleanup_stopped()` → Result

**ManagedProcess**:
```rust
{
  unit_id: UUID,
  name: String,
  package_name: String,
  pid: u32,
  status: String
}
```

---

### 3.4 TelemetryAgent
Автоматический сбор и отправка метрик

**Методы**:
- `start()` → бесконечный цикл heartbeat + metrics
- `send_log(unit_id, level, message)` → Result
- `send_event(unit_id, event_name, data)` → Result
- `send_error(unit_id, message, details)` → Result

**Автоматически собирает**:
- Heartbeat каждые N секунд
- CPU usage процесса
- Memory usage (RSS, VSZ)
- Статус процесса

---

## 4. Workflow сценарии

### 4.1 Публикация пакета автором

```
1. Автор создает проект в Netbit
2. POST /api/spark/packages - регистрирует пакет
3. POST /api/spark/packages/{name}/versions - публикует версию 1.0.0
4. Загружает архив на CDN, указывает download_url
5. Пакет доступен в реестре для других пользователей
```

---

### 4.2 Установка и запуск пользователем

```
1. Пользователь: spark search sipd
   → PackageManager.search("sipd")
   → GET /api/spark/packages/search?q=sipd
   
2. Пользователь: spark install sipd
   → PackageManager.install("sipd")
   → POST /api/spark/packages/install
   → Скачивает файлы в ~/.netbit/spark/packages/sipd/
   → Сохраняет метаданные
   
3. Пользователь: spark run sipd --name "prod-instance"
   → ProcessManager.start("sipd", "prod-instance", "node", ["index.js"])
   → POST /api/spark/units (создает unit в БД)
   → Запускает процесс локально
   → PUT /api/spark/units/{id}/status (status=running, pid=12345)
   
4. TelemetryAgent автоматически:
   → POST /api/spark/units/{id}/heartbeat каждые 30 сек
   → POST /api/spark/units/{id}/telemetry с метриками CPU/Memory
   
5. Пользователь смотрит статус: spark status
   → ProcessManager.list()
   → Показывает все запущенные units
   
6. На сервере можно смотреть:
   → GET /api/spark/units/{id}/logs - последние логи
   → GET /api/spark/units/{id}/metrics - графики метрик
```

---

### 4.3 Мониторинг через Web интерфейс

```
1. Пользователь заходит на /dashboard
2. Видит список всех своих remote units
3. Для каждого unit:
   - Статус (running/stopped)
   - Uptime
   - Last heartbeat
   - CPU/Memory usage (графики)
   - Логи в реальном времени
4. Может остановить unit через веб-интерфейс
   → DELETE /api/spark/units/{id}
   → Клиент получает сигнал и останавливает процесс
```

---

## 5. CLI Commands (планируется)

| Команда | Описание | Пример |
|---------|----------|--------|
| `spark search <query>` | Поиск пакетов | `spark search signal` |
| `spark info <name>` | Информация о пакете | `spark info sipd` |
| `spark install <name>` | Установить пакет | `spark install sipd` |
| `spark uninstall <name>` | Удалить пакет | `spark uninstall sipd` |
| `spark list` | Список установленных | `spark list` |
| `spark run <name>` | Запустить unit | `spark run sipd --name prod` |
| `spark stop <unit_id>` | Остановить unit | `spark stop abc123...` |
| `spark status` | Список запущенных units | `spark status` |
| `spark logs <unit_id>` | Показать логи | `spark logs abc123... -n 100` |
| `spark publish` | Опубликовать пакет | `spark publish ./my-package` |

---

## 6. Безопасность

### 6.1 Аутентификация
- Все API endpoints (кроме публичного списка) требуют JWT токен
- Токен передается в header: `Authorization: Bearer <token>`
- При создании unit проверяется, что пакет установлен пользователем

### 6.2 Авторизация
- Пользователь может управлять только своими units
- Пользователь может публиковать версии только своих пакетов
- Проверка owner_id на сервере

### 6.3 Изоляция
- Каждый unit запускается от имени пользователя
- Процессы изолированы друг от друга
- Нет доступа к пакетам других пользователей

---

## 7. Метрики и мониторинг

### 7.1 Метрики пакетов
- Количество загрузок
- Количество активных units
- Популярность по категориям

### 7.2 Метрики units
- Uptime
- CPU usage %
- Memory usage (RSS, VSZ)
- Network activity (планируется)
- Disk I/O (планируется)

### 7.3 Алерты (планируется)
- Unit не отвечает > 5 минут → status=failed
- Memory usage > 90% → предупреждение
- CPU usage > 80% длительное время → предупреждение

---

## 8. Roadmap

### Phase 1 (Current) ✓
- [x] Database schema
- [x] REST API для packages, units, telemetry
- [x] Client components (API client, package manager, process manager)
- [x] Telemetry agent

### Phase 2 (Next)
- [ ] CLI команды
- [ ] Web dashboard для мониторинга
- [ ] Package publish workflow
- [ ] Автоматическое обновление пакетов

### Phase 3 (Future)
- [ ] Docker/container support
- [ ] Distributed units (запуск на разных машинах)
- [ ] Resource limits (CPU/Memory)
- [ ] Health checks
- [ ] Auto-restart on failure
- [ ] Log streaming (WebSocket)
- [ ] Metrics aggregation и визуализация

---

## 9. Примеры использования

### Пример 1: Научный эксперимент
```bash
# Исследователь публикует свою модель ML
spark publish ./neural-net-model

# Другой ученый находит и устанавливает
spark search neural-net
spark install neural-net-model

# Запускает для обучения
spark run neural-net-model --name training-session-1

# Мониторит прогресс через dashboard
# GPU usage, loss metrics, training logs в реальном времени
```

### Пример 2: Биомедицинский анализ
```bash
# Установка анализатора
spark install biotronica-analyzer

# Запуск анализа данных
spark run biotronica-analyzer --name patient-123-analysis

# Telemetry отправляет:
# - Прогресс обработки
# - Промежуточные результаты
# - Warnings/errors
# Все сохраняется на сервере для дальнейшего изучения
```

### Пример 3: Долгосрочный сервис
```bash
# Запуск API сервера как unit
spark run my-api-server --name production-api

# Unit работает 24/7:
# - Отправляет heartbeat каждые 30 сек
# - Логирует все запросы
# - Отправляет метрики (requests/sec, latency)
# - Алерты при ошибках

# Удаленный мониторинг через веб-интерфейс
# Можно перезапустить при необходимости
```
