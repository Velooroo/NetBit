// ============================================================================
// ОБЩИЕ ТИПЫ ДЛЯ ВСЕГО ПРОЕКТА NETBIT
// ============================================================================

// Пользователь
export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  is_active: boolean;
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

// Чат и сообщения (для мобильного приложения)
export interface Chat {
  id: string;
  name: string;
  participants: User[];
  last_message?: Message;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: number;
  content: string;
  type: MessageType;
  created_at: string;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system'
}

// Контакт (для мобильного приложения)
export interface Contact {
  id: string;
  name: string;
  status: string;
  online: boolean;
  notification: boolean;
  lastMessageData: string;
  isPinned?: boolean;
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
  user: User;
  token: string;
  expires_at: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
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
