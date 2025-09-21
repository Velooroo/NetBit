import { ApiClient } from './client';
import {
  User,
  Project,
  Repository,
  Notification,
  Chat,
  Message,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  GitCommit,
  GitBranch,
  ApiResponse,
  PaginatedResponse,
} from '../types';

// ============================================================================
// API СЕРВИСЫ ДЛЯ ВСЕХ МОДУЛЕЙ
// ============================================================================

export class AuthService {
  constructor(private client: ApiClient) {}

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.client.post<LoginResponse>('/auth/login', credentials);
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    return this.client.post<User>('/auth/register', userData);
  }

  async logout(): Promise<ApiResponse<void>> {
    const result = await this.client.post<void>('/auth/logout');
    this.client.clearToken();
    return result;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.client.get<User>('/user/profile');
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

  async getRepository(user: string, project: string, repo: string): Promise<ApiResponse<Repository>> {
    return this.client.get<Repository>(`/projects/${user}/${project}/repos/${repo}`);
  }

  async createRepository(projectId: number, repoData: Partial<Repository>): Promise<ApiResponse<Repository>> {
    return this.client.post<Repository>(`/projects/${projectId}/repos/create`, repoData);
  }

  async getCommits(user: string, project: string, repo: string, branch = 'main'): Promise<ApiResponse<GitCommit[]>> {
    return this.client.get<GitCommit[]>(`/git/${user}/${project}/${repo}/commits?branch=${branch}`);
  }

  async getBranches(user: string, project: string, repo: string): Promise<ApiResponse<GitBranch[]>> {
    return this.client.get<GitBranch[]>(`/git/${user}/${project}/${repo}/branches`);
  }

  async getFileContent(user: string, project: string, repo: string, path: string): Promise<ApiResponse<string>> {
    return this.client.get<string>(`/git/${user}/${project}/${repo}/file/${path}`);
  }
}

export class NotificationService {
  constructor(private client: ApiClient) {}

  async getNotifications(page = 1, perPage = 20): Promise<PaginatedResponse<Notification>> {
    return this.client.getPaginated<Notification>('/notifications', { page, per_page: perPage });
  }

  async markAsRead(id: number): Promise<ApiResponse<void>> {
    return this.client.put<void>(`/notifications/${id}`, { is_read: true });
  }

  async markAllAsRead(): Promise<ApiResponse<void>> {
    return this.client.put<void>('/notifications/mark-all-read');
  }

  async deleteNotification(id: number): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/notifications/${id}`);
  }
}

export class ChatService {
  constructor(private client: ApiClient) {}

  async getChats(): Promise<ApiResponse<Chat[]>> {
    return this.client.get<Chat[]>('/chats');
  }

  async getChat(chatId: string): Promise<ApiResponse<Chat>> {
    return this.client.get<Chat>(`/chats/${chatId}`);
  }

  async getMessages(chatId: string, page = 1, perPage = 50): Promise<PaginatedResponse<Message>> {
    return this.client.getPaginated<Message>(`/chats/${chatId}/messages`, { page, per_page: perPage });
  }

  async sendMessage(chatId: string, content: string): Promise<ApiResponse<Message>> {
    return this.client.post<Message>(`/chats/${chatId}/messages`, { content });
  }

  async createChat(participants: number[]): Promise<ApiResponse<Chat>> {
    return this.client.post<Chat>('/chats', { participants });
  }
}

// ============================================================================
// ГЛАВНЫЙ API КЛАСС
// ============================================================================

export class NetBitApi {
  public auth: AuthService;
  public projects: ProjectService;
  public repositories: RepositoryService;
  public notifications: NotificationService;
  public chats: ChatService;

  constructor(private client: ApiClient) {
    this.auth = new AuthService(client);
    this.projects = new ProjectService(client);
    this.repositories = new RepositoryService(client);
    this.notifications = new NotificationService(client);
    this.chats = new ChatService(client);
  }

  // Установка токена для всех сервисов
  setToken(token: string): void {
    this.client.setToken(token);
  }

  // Очистка токена
  clearToken(): void {
    this.client.clearToken();
  }
}

// Фабрика для создания API
export const createNetBitApi = (baseURL: string): NetBitApi => {
  const client = new ApiClient(baseURL);
  return new NetBitApi(client);
};
