# 📚 NetBit - Полная документация

## 🎯 Обзор проекта

NetBit - это современная платформа для разработчиков, объединяющая Git-сервер, систему управления проектами и мессенджер в единую экосистему. Проект построен как монорепозиторий с разделением на платформы.

## 🏗️ Архитектура

### Структура проекта
```
netbit/
├── packages/
│   ├── backend/          # Rust backend (Git HTTP Server + API)
│   ├── web/             # React веб-приложение
│   ├── mobile/          # React Native мобильное приложение
│   └── shared/          # Общие TypeScript типы и API клиент
├── package.json         # Workspace конфигурация
├── README.md           # Основная документация
├── QUICKSTART.md       # Быстрый старт
├── DOCUMENTATION.md    # Полная документация (этот файл)
└── .gitignore         # Настроенный для всех платформ
```

### Принципы архитектуры
- **Монорепозиторий** - все компоненты в одном репозитории
- **Разделение ответственности** - каждый пакет имеет свою роль
- **Общие типы** - централизованная типизация в shared пакете
- **API-first** - backend предоставляет RESTful API
- **Кроссплатформенность** - веб и мобильные приложения

## 🔧 Backend (Rust)

### Технологический стек
- **Rust 1.70+** - системный язык программирования
- **Actix Web 4.x** - асинхронный веб-фреймворк
- **SQLite** - встроенная база данных
- **Serde** - сериализация/десериализация JSON
- **Git2** - работа с Git репозиториями
- **Rusqlite** - SQLite драйвер для Rust

### Структура backend
```
packages/backend/
├── src/
│   ├── main.rs              # Точка входа приложения
│   ├── api/                 # HTTP обработчики
│   │   ├── mod.rs
│   │   ├── chat.rs          # API для чатов
│   │   ├── git.rs           # Git Smart HTTP Protocol
│   │   ├── notification.rs  # API уведомлений
│   │   ├── project.rs       # API проектов
│   │   ├── repo.rs          # API репозиториев
│   │   └── user.rs          # API пользователей
│   ├── core/                # Ядро системы
│   │   ├── mod.rs
│   │   ├── auth.rs          # Аутентификация и авторизация
│   │   ├── config.rs        # Конфигурация сервера
│   │   ├── database.rs      # Работа с базой данных
│   │   └── types.rs         # Общие типы и структуры
│   ├── domain/              # Бизнес-логика
│   │   ├── mod.rs
│   │   ├── chat.rs          # Модели чатов и сообщений
│   │   ├── notification.rs  # Модель уведомлений
│   │   ├── project.rs       # Модель проектов
│   │   ├── repository.rs    # Модель репозиториев
│   │   └── user.rs          # Модель пользователей
│   └── utils/               # Утилиты
│       ├── mod.rs
│       ├── git.rs           # Git утилиты
│       └── helpers.rs       # Вспомогательные функции
├── Cargo.toml              # Зависимости Rust
└── .env                    # Переменные окружения (создать)
```

### Конфигурация backend

#### Переменные окружения (.env)
```env
# Сервер
HOST=127.0.0.1
PORT=8000

# База данных
DATABASE_URL=./gitea.db

# Git
GIT_ROOT_PATH=./repositories

# Безопасность
JWT_SECRET=your-super-secret-jwt-key-here

# Логирование
RUST_LOG=info
```

#### Конфигурация по умолчанию
```rust
ServerConfig {
    host: "0.0.0.0",
    port: 8000,
    database_url: "gitea.db",
    jwt_secret: "default-secret", // ⚠️ Изменить в продакшене!
    repositories_path: "repositories",
}
```

### База данных

#### Схема базы данных
```sql
-- Пользователи
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Проекты
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    owner_id INTEGER NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users (id),
    UNIQUE(name, owner_id)
);

-- Конфигурации проектов
CREATE TABLE project_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL UNIQUE,
    config_json TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

-- Репозитории
CREATE TABLE repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    owner_id INTEGER NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id),
    FOREIGN KEY (owner_id) REFERENCES users (id),
    UNIQUE(name, project_id)
);

-- Уведомления
CREATE TABLE notification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Чаты
CREATE TABLE chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    chat_type TEXT NOT NULL CHECK(chat_type IN ('direct', 'group', 'channel')),
    creator_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users (id)
);

-- Участники чатов
CREATE TABLE chat_participants (
    chat_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'moderator', 'member')),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_read_at DATETIME,
    PRIMARY KEY (chat_id, user_id),
    FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Сообщения
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK(message_type IN ('text', 'image', 'file', 'system')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_edited BOOLEAN NOT NULL DEFAULT 0,
    edited_at DATETIME,
    FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users (id)
);

-- Индексы для оптимизации
CREATE INDEX idx_messages_chat_id ON messages (chat_id);
CREATE INDEX idx_messages_created_at ON messages (created_at);
CREATE INDEX idx_chat_participants_user_id ON chat_participants (user_id);
```

### API Endpoints

#### Аутентификация
```
POST /api/auth/login
POST /api/auth/register
GET  /api/user/profile
```

#### Проекты
```
GET  /api/projects                    # Список проектов пользователя
GET  /api/projects/public             # Публичные проекты
POST /api/projects/create             # Создание проекта
GET  /api/projects/{user}/{project}   # Информация о проекте
GET  /api/projects/{user}/{project}/config    # Конфигурация проекта
PUT  /api/projects/{user}/{project}/config    # Обновление конфигурации
POST /api/projects/{user}/{project}/repos/create  # Создание репозитория в проекте
```

#### Репозитории (устаревшие)
```
GET  /api/repos           # Список репозиториев
POST /api/repos/create    # Создание репозитория
GET  /api/repos/{name}    # Информация о репозитории
```

#### Чаты (новое!)
```
GET  /api/chats                    # Список чатов пользователя
POST /api/chats                    # Создание чата
GET  /api/chats/{id}               # Информация о чате
GET  /api/chats/{id}/messages      # Сообщения чата (с пагинацией)
POST /api/chats/{id}/messages      # Отправка сообщения
```

#### Уведомления
```
GET    /api/notifications     # Список уведомлений
POST   /api/notifications     # Создание уведомления
PUT    /api/notifications/{id}  # Обновление уведомления
DELETE /api/notifications/{id}  # Удаление уведомления
```

#### Git Smart HTTP Protocol
```
GET  /git/{user}/{repo}/info/refs           # Git info refs
POST /git/{user}/{repo}/git-upload-pack     # Git upload pack (pull)
POST /git/{user}/{repo}/git-receive-pack    # Git receive pack (push)
```

### Модели данных

#### Chat (Чат)
```rust
pub struct Chat {
    pub id: Option<i64>,
    pub name: String,
    pub chat_type: ChatType,  // Direct, Group, Channel
    pub creator_id: i64,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

pub enum ChatType {
    Direct,   // Личный чат между двумя пользователями
    Group,    // Групповой чат
    Channel,  // Канал (только админы могут писать)
}
```

#### Message (Сообщение)
```rust
pub struct Message {
    pub id: Option<i64>,
    pub chat_id: i64,
    pub sender_id: i64,
    pub content: String,
    pub message_type: MessageType,
    pub created_at: Option<String>,
    pub is_edited: bool,
    pub edited_at: Option<String>,
}

pub enum MessageType {
    Text,    // Текстовое сообщение
    Image,   // Изображение
    File,    // Файл
    System,  // Системное сообщение
}
```

#### ChatParticipant (Участник чата)
```rust
pub struct ChatParticipant {
    pub chat_id: i64,
    pub user_id: i64,
    pub role: ChatRole,
    pub joined_at: Option<String>,
    pub last_read_at: Option<String>,
}

pub enum ChatRole {
    Admin,      // Администратор
    Moderator,  // Модератор
    Member,     // Обычный участник
}
```

### Запуск backend
```bash
# Разработка
cd packages/backend
cargo run

# Продакшен
cargo build --release
./target/release/git-server-backend

# Через npm скрипт
npm run dev:backend
```

## 🌐 Web приложение (React)

### Технологический стек
- **React 18** - UI библиотека
- **TypeScript** - типизированный JavaScript
- **Vite** - современный сборщик
- **Tailwind CSS** - utility-first CSS фреймворк

### Структура web
```
packages/web/
├── src/
│   ├── components/          # React компоненты
│   │   ├── Header.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── RepositoryCard.tsx
│   │   └── Sidebar.tsx
│   ├── context/            # React контексты
│   │   └── AuthContext.tsx
│   ├── lib/               # Библиотеки и утилиты
│   │   └── graph/
│   │       └── filesystem.tsx
│   ├── pages/             # Страницы приложения
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RepoPage.tsx
│   ├── App.tsx            # Главный компонент
│   ├── main.tsx           # Точка входа
│   └── index.css          # Стили
├── index.html             # HTML шаблон
├── package.json           # Зависимости
├── tailwind.config.js     # Конфигурация Tailwind
├── tsconfig.json          # Конфигурация TypeScript
└── vite.config.ts         # Конфигурация Vite
```

### Запуск web
```bash
cd packages/web
npm start

# Или через npm скрипт
npm run dev:web
```

## 📱 Mobile приложение (React Native)

### Технологический стек
- **React Native** - кроссплатформенная разработка
- **Expo** - платформа для React Native
- **Expo Router** - файловая навигация
- **TypeScript** - типизация

### Структура mobile
```
packages/mobile/
├── app/                   # Expo Router страницы
│   ├── (tabs)/           # Табы навигации
│   │   ├── index.tsx     # Главная (чаты)
│   │   ├── projects.tsx  # Проекты
│   │   └── profile.tsx   # Профиль
│   ├── chat/            # Чаты
│   │   └── [id].tsx     # Экран конкретного чата
│   └── _layout.tsx      # Корневой layout
├── app.json             # Конфигурация Expo
├── package.json         # Зависимости
└── tsconfig.json        # Конфигурация TypeScript
```

### Запуск mobile
```bash
cd packages/mobile
npm start

# Или через npm скрипт
npm run dev:mobile
```

## 🔗 Shared пакет (TypeScript)

### Назначение
Централизованное место для:
- Общих TypeScript типов
- API клиента с типизацией
- Сервисов для работы с API
- Утилит и констант

### Структура shared
```
packages/shared/
├── src/
│   ├── types/           # TypeScript типы
│   │   └── index.ts     # Все типы данных
│   ├── api/            # API клиент
│   │   ├── client.ts    # HTTP клиент
│   │   └── services.ts  # API сервисы
│   └── index.ts        # Экспорты пакета
├── package.json        # Зависимости
└── tsconfig.json       # Конфигурация TypeScript
```

### Типы данных
```typescript
// Пользователь
export interface User {
  id: number;
  username: string;
  email?: string;
  created_at?: string;
}

// Проект
export interface Project {
  id: number;
  name: string;
  owner_id: number;
  description?: string;
  is_public: boolean;
  created_at?: string;
}

// Чат
export interface Chat {
  id: number;
  name: string;
  chat_type: 'direct' | 'group' | 'channel';
  creator_id: number;
  created_at?: string;
  updated_at?: string;
}

// Сообщение
export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  created_at?: string;
  is_edited: boolean;
  edited_at?: string;
}

// API ответы
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}
```

### API клиент
```typescript
class ApiClient {
  private client: AxiosInstance;
  
  constructor(baseURL: string = 'http://localhost:8000') {
    this.client = axios.create({ baseURL });
  }
  
  // Методы для работы с API
  async get<T>(url: string): Promise<T>
  async post<T>(url: string, data?: any): Promise<T>
  async put<T>(url: string, data?: any): Promise<T>
  async delete<T>(url: string): Promise<T>
}
```

### Сервисы
```typescript
// Сервис чатов
export class ChatService {
  static async getChats(): Promise<Chat[]>
  static async createChat(data: CreateChatRequest): Promise<{ id: number }>
  static async getMessages(chatId: number, page?: number): Promise<PaginatedResponse<Message>>
  static async sendMessage(chatId: number, content: string): Promise<{ id: number }>
}

// Сервис проектов
export class ProjectService {
  static async getProjects(): Promise<Project[]>
  static async createProject(data: CreateProjectRequest): Promise<{ id: number }>
  static async getProject(user: string, project: string): Promise<Project>
}

// Сервис пользователей
export class UserService {
  static async login(username: string, password: string): Promise<LoginResponse>
  static async register(data: RegisterRequest): Promise<{ id: number }>
  static async getProfile(): Promise<User>
}
```

### Сборка shared
```bash
cd packages/shared
npm run build

# Создает dist/ с скомпилированными файлами
```

## 🚀 Развертывание

### Workspace команды
```bash
# Установка всех зависимостей
npm run install:all

# Запуск в режиме разработки
npm run dev:backend    # Rust сервер
npm run dev:web        # React приложение
npm run dev:mobile     # React Native приложение

# Сборка для продакшена
npm run build:backend  # Rust binary
npm run build:web      # Статические файлы
npm run build:mobile   # APK/IPA файлы

# Линтинг и тесты
npm run lint          # Проверка кода
npm run test          # Запуск тестов
```

### Продакшен развертывание

#### Backend
```bash
cd packages/backend

# Сборка release версии
cargo build --release

# Настройка переменных окружения
export HOST=0.0.0.0
export PORT=8000
export DATABASE_URL=/path/to/production.db
export JWT_SECRET=your-production-secret
export GIT_ROOT_PATH=/path/to/repositories

# Запуск
./target/release/git-server-backend
```

#### Web
```bash
cd packages/web

# Сборка статических файлов
npm run build

# Деплой dist/ на веб-сервер (nginx, apache, etc.)
```

#### Mobile
```bash
cd packages/mobile

# Android
expo build:android

# iOS
expo build:ios

# Или через EAS Build
eas build --platform all
```

## 🔄 Git интеграция

### Поддерживаемые операции
- **Clone** - клонирование репозиториев
- **Push** - отправка изменений
- **Pull** - получение изменений
- **Fetch** - получение метаданных

### Примеры использования
```bash
# Клонирование
git clone http://localhost:8000/git/username/repository.git

# Добавление remote
git remote add origin http://localhost:8000/git/username/repository.git

# Push
git push origin main

# Pull
git pull origin main
```

### Аутентификация Git
- **HTTP Basic Auth** - username/password
- **Token Auth** - JWT токены (планируется)

## 🔐 Безопасность

### Текущие меры
- **JWT токены** - для API аутентификации
- **Password hashing** - bcrypt для паролей
- **SQL injection protection** - параметризованные запросы
- **CORS** - настроенный для разработки

### Рекомендации для продакшена
- Установить сильный JWT_SECRET
- Использовать HTTPS
- Настроить CORS для конкретных доменов
- Добавить rate limiting
- Настроить логирование безопасности

## 📊 Мониторинг и логирование

### Логирование
```rust
// Уровни логирования
RUST_LOG=error    # Только ошибки
RUST_LOG=warn     # Предупреждения и ошибки
RUST_LOG=info     # Информационные сообщения (по умолчанию)
RUST_LOG=debug    # Отладочная информация
RUST_LOG=trace    # Максимальная детализация
```

### Метрики
- Время ответа API
- Количество активных соединений
- Использование памяти
- Размер базы данных

## 🧪 Тестирование

### Backend тесты
```bash
cd packages/backend
cargo test
```

### Frontend тесты
```bash
cd packages/web
npm test

cd packages/mobile
npm test
```

### Интеграционные тесты
```bash
# Запуск всех тестов
npm run test:all
```

## 🔧 Разработка

### Добавление новых API endpoints
1. Создать обработчик в `packages/backend/src/api/`
2. Добавить маршрут в `main.rs`
3. Создать доменную модель в `packages/backend/src/domain/`
4. Добавить типы в `packages/shared/src/types/`
5. Создать сервис в `packages/shared/src/api/services.ts`

### Добавление новых экранов в mobile
1. Создать файл в `packages/mobile/app/`
2. Использовать типы из `@netbit/shared`
3. Интегрировать с API сервисами

### Добавление новых компонентов в web
1. Создать компонент в `packages/web/src/components/`
2. Использовать типы из `@netbit/shared`
3. Интегрировать с API сервисами

## 🐛 Отладка

### Backend отладка
```bash
# Запуск с отладочной информацией
RUST_LOG=debug cargo run

# Проверка базы данных
sqlite3 gitea.db ".tables"
sqlite3 gitea.db "SELECT * FROM chats;"
```

### Frontend отладка
- React DevTools
- Chrome DevTools
- Network tab для API запросов

### Общие проблемы
1. **CORS ошибки** - проверить настройки в main.rs
2. **База данных заблокирована** - закрыть другие подключения
3. **Порт занят** - изменить PORT в .env
4. **Зависимости не установлены** - запустить npm install

## 📈 Планы развития

### Краткосрочные (1-2 месяца)
- [ ] WebSocket для real-time чатов
- [ ] Файловые вложения в сообщениях
- [ ] Push-уведомления в mobile
- [ ] Улучшенная аутентификация

### Среднесрочные (3-6 месяцев)
- [ ] Видеозвонки в чатах
- [ ] Интеграция с CI/CD
- [ ] Расширенные права доступа
- [ ] Плагины и расширения

### Долгосрочные (6+ месяцев)
- [ ] Микросервисная архитектура
- [ ] Kubernetes деплой
- [ ] Машинное обучение для рекомендаций
- [ ] Интеграция с внешними сервисами

---

**NetBit** - Объединяем разработку, общение и управление проектами в одной платформе! 🚀

*Документация обновлена: 28 июля 2025*
