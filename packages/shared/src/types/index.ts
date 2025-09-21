// ============================================================================
// ОБЩИЕ ТИПЫ ДЛЯ ВСЕГО ПРОЕКТА NETBIT
// ============================================================================

// Пользователь - базовая информация
export interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  avatar?: string;
  bio?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Публичный профиль пользователя
export interface UserProfile {
  id: number;
  username: string;
  full_name?: string;
  avatar?: string;
  bio?: string;
  is_active: boolean;
  created_at?: string;
}

// Статистика пользователя
export interface UserStats {
  projects_count: number;
  repositories_count: number;
  messages_count: number;
  last_activity?: string;
}

// Пользователь с статистикой
export interface UserWithStats {
  profile: UserProfile;
  stats: UserStats;
}

// Проект
export interface Project {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
}

// Репозиторий
export interface Repository {
  id: number;
  name: string;
  project_id: number;
  description?: string;
  is_private: boolean;
  clone_url: string;
  size: number;
  created_at: string;
  updated_at?: string;
}

// Уведомление
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success'
}

// ============================================================================
// ЧАТЫ И СООБЩЕНИЯ (ОБНОВЛЕНО ПОД BACKEND)
// ============================================================================

// Чат
export interface Chat {
  id?: number;
  name: string;
  description?: string;
  chat_type: ChatType;
  creator_id: number;
  avatar?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Тип чата
export enum ChatType {
  DIRECT = 'direct',
  GROUP = 'group',
  CHANNEL = 'channel'
}

// Сообщение
export interface Message {
  id?: number;
  chat_id: number;
  sender_id: number;
  content: string;
  message_type: MessageType;
  reply_to?: number;
  is_read: boolean;
  is_edited: boolean;
  created_at?: string;
  updated_at?: string;
}

// Тип сообщения
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system'
}

// Участник чата
export interface ChatMember {
  id?: number;
  chat_id: number;
  user_id: number;
  role: ChatRole;
  joined_at?: string;
}

// Роль в чате
export enum ChatRole {
  MEMBER = 'member',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  OWNER = 'owner'
}

// Чат с дополнительной информацией
export interface ChatWithLastMessage {
  chat: Chat;
  last_message?: Message;
  unread_count: number;
  member_count: number;
}

// Сообщение с информацией об отправителе
export interface MessageWithSender {
  message: Message;
  sender_username: string;
  sender_avatar?: string;
}

// Ответ с информацией о чате
export interface ChatResponse {
  chat: Chat;
  members: ChatMember[];
  last_message?: Message;
  unread_count: number;
}

// Ответ со списком сообщений
export interface MessagesResponse {
  messages: MessageWithSender[];
  total: number;
  has_more: boolean;
}

// ============================================================================
// API ЗАПРОСЫ И ОТВЕТЫ
// ============================================================================

// Создание чата
export interface CreateChatRequest {
  name: string;
  description?: string;
  chat_type: string;
  members: number[];
}

// Отправка сообщения
export interface SendMessageRequest {
  content: string;
  message_type?: string;
  reply_to?: number;
}

// Добавление участника
export interface AddMemberRequest {
  user_id: number;
  role?: string;
}

// API Response типы
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

// Аутентификация
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: UserProfile;
  token: string;
}

export interface RegisterRequest {
  username: string;
  email?: string;
  password: string;
  full_name?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  bio?: string;
  avatar?: string;
}

// ============================================================================
// LEGACY ТИПЫ (ДЛЯ СОВМЕСТИМОСТИ)
// ============================================================================

// Контакт (для мобильного приложения) - устарело, используйте ChatWithLastMessage
export interface Contact {
  id: string;
  name: string;
  status: string;
  online: boolean;
  notification: boolean;
  lastMessageData: string;
  isPinned?: boolean;
}

// Git операции
export interface GitCommit {
  hash: string;
  author: string;
  message: string;
  date: string;
}

export interface GitBranch {
  name: string;
  is_default: boolean;
  last_commit: GitCommit;
}

// Конфигурация приложения
export interface AppConfig {
  api_url: string;
  git_url: string;
  version: string;
  features: {
    chat_enabled: boolean;
    git_enabled: boolean;
    notifications_enabled: boolean;
  };
}

// Ошибки
export interface AppError {
  code: string;
  message: string;
  details?: string;
}

// Утилитарные типы
export type ID = string | number;
export type Timestamp = string;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
