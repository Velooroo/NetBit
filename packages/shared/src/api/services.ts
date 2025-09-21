import { ApiClient } from './client';
import {
  User, UserProfile, UserStats, UserWithStats,
  Project,
  Repository,
  Notification,
  Chat, Message, ChatMember, ChatWithLastMessage, MessageWithSender,
  ChatResponse, MessagesResponse,
  LoginRequest, LoginResponse, RegisterRequest, UpdateProfileRequest,
  CreateChatRequest, SendMessageRequest, AddMemberRequest,
  GitCommit, GitBranch,
  ApiResponse, PaginatedResponse,
} from '../types';

// ============================================================================
// API СЕРВИСЫ ДЛЯ ВСЕХ МОДУЛЕЙ
// ============================================================================

export class AuthService {
  constructor(private client: ApiClient) {}

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.client.post<LoginResponse>('/auth/login', credentials);
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<UserProfile>> {
    return this.client.post<UserProfile>('/auth/register', userData);
  }

  async logout(): Promise<ApiResponse<void>> {
    const result = await this.client.post<void>('/auth/logout');
    this.client.clearToken();
    return result;
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.client.post<{ token: string }>('/auth/refresh');
  }
}

export class UserService {
  constructor(private client: ApiClient) {}

  async getProfile(): Promise<ApiResponse<UserWithStats>> {
    return this.client.get<UserWithStats>('/users/profile');
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    return this.client.put<UserProfile>('/users/profile', data);
  }

  async getUserById(id: number): Promise<ApiResponse<UserWithStats>> {
    return this.client.get<UserWithStats>(`/users/${id}`);
  }

  async getUsers(): Promise<ApiResponse<UserProfile[]>> {
    return this.client.get<UserProfile[]>('/users');
  }
}

export class ChatService {
  constructor(private client: ApiClient) {}

  async getUserChats(): Promise<ApiResponse<ChatWithLastMessage[]>> {
    return this.client.get<ChatWithLastMessage[]>('/chats');
  }

  async getChat(chatId: number): Promise<ApiResponse<ChatResponse>> {
    return this.client.get<ChatResponse>(`/chats/${chatId}`);
  }

  async createChat(data: CreateChatRequest): Promise<ApiResponse<ChatResponse>> {
    return this.client.post<ChatResponse>('/chats', data);
  }

  async getChatMessages(
    chatId: number, 
    params?: { limit?: number; offset?: number }
  ): Promise<ApiResponse<MessagesResponse>> {
    return this.client.get<MessagesResponse>(`/chats/${chatId}/messages`, { params });
  }

  async sendMessage(
    chatId: number, 
    message: SendMessageRequest
  ): Promise<ApiResponse<MessageWithSender>> {
    return this.client.post<MessageWithSender>(`/chats/${chatId}/messages`, message);
  }

  async addMember(
    chatId: number, 
    member: AddMemberRequest
  ): Promise<ApiResponse<ChatMember>> {
    return this.client.post<ChatMember>(`/chats/${chatId}/members`, member);
  }

  async markMessagesAsRead(chatId: number): Promise<ApiResponse<void>> {
    return this.client.put<void>(`/chats/${chatId}/read`);
  }
}

export class ProjectService {
  constructor(private client: ApiClient) {}

  async getProjects(page = 1, perPage = 20): Promise<PaginatedResponse<Project>> {
    return this.client.getPaginated<Project>('/projects', { page, per_page: perPage });
  }

  async getPublicProjects(page = 1, perPage = 20): Promise<PaginatedResponse<Project>> {
    return this.client.getPaginated<Project>('/projects/public', { page, per_page: perPage });
  }

  async getProject(user: string, project: string): Promise<ApiResponse<Project>> {
    return this.client.get<Project>(`/projects/${user}/${project}`);
  }

  async createProject(projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.client.post<Project>('/projects/create', projectData);
  }

  async updateProject(id: number, projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.client.put<Project>(`/projects/${id}`, projectData);
  }

  async deleteProject(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/projects/${id}`);
  }
}

export class RepositoryService {
  constructor(private client: ApiClient) {}

  async getRepositories(projectId: number): Promise<ApiResponse<Repository[]>> {
    return this.client.get<Repository[]>(`/projects/${projectId}/repositories`);
  }

  async getRepository(owner: string, repo: string): Promise<ApiResponse<Repository>> {
    return this.client.get<Repository>(`/repositories/${owner}/${repo}`);
  }

  async createRepository(repoData: Partial<Repository>): Promise<ApiResponse<Repository>> {
    return this.client.post<Repository>('/repositories', repoData);
  }

  async getCommits(owner: string, repo: string, branch = 'main'): Promise<ApiResponse<GitCommit[]>> {
    return this.client.get<GitCommit[]>(`/repositories/${owner}/${repo}/commits`, {
      params: { branch }
    });
  }

  async getBranches(owner: string, repo: string): Promise<ApiResponse<GitBranch[]>> {
    return this.client.get<GitBranch[]>(`/repositories/${owner}/${repo}/branches`);
  }

  async getFileContent(
    owner: string, 
    repo: string, 
    path: string, 
    branch = 'main'
  ): Promise<ApiResponse<{ content: string; encoding: string }>> {
    return this.client.get<{ content: string; encoding: string }>(
      `/repositories/${owner}/${repo}/contents/${path}`,
      { params: { branch } }
    );
  }
}

export class NotificationService {
  constructor(private client: ApiClient) {}

  async getNotifications(page = 1, perPage = 20): Promise<PaginatedResponse<Notification>> {
    return this.client.getPaginated<Notification>('/notifications', { page, per_page: perPage });
  }

  async markAsRead(notificationId: number): Promise<ApiResponse<void>> {
    return this.client.put<void>(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<ApiResponse<void>> {
    return this.client.put<void>('/notifications/read-all');
  }

  async deleteNotification(notificationId: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/notifications/${notificationId}`);
  }
}

// ============================================================================
// ГЛАВНЫЙ API КЛАСС
// ============================================================================

export class NetBitApi {
  public auth: AuthService;
  public users: UserService;
  public chats: ChatService;
  public projects: ProjectService;
  public repositories: RepositoryService;
  public notifications: NotificationService;

  constructor(private client: ApiClient) {
    this.auth = new AuthService(client);
    this.users = new UserService(client);
    this.chats = new ChatService(client);
    this.projects = new ProjectService(client);
    this.repositories = new RepositoryService(client);
    this.notifications = new NotificationService(client);
  }

  // Установка токена для всех сервисов
  setToken(token: string): void {
    this.client.setToken(token);
  }

  // Очистка токена
  clearToken(): void {
    this.client.clearToken();
  }

  // Получение базового URL
  getBaseURL(): string {
    return this.client.getBaseURL();
  }
}

// Фабрика для создания API
export const createNetBitApi = (baseURL: string): NetBitApi => {
  const client = new ApiClient(baseURL);
  return new NetBitApi(client);
};

// Экспорт дефолтного экземпляра
export const api = createNetBitApi(
  process.env.REACT_APP_API_URL || 'http://localhost:8000/api'
);