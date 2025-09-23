import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse, AppError } from '../types';

// ============================================================================
// API CLIENT ДЛЯ ВСЕХ ПЛАТФОРМ
// ============================================================================

export class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor для добавления токена
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = this.token;
      }
      return config;
    });

    // Interceptor для обработки ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          // Можно добавить редирект на логин
        }
        return Promise.reject(error);
      }
    );
  }

  // Установка токена авторизации
  setToken(token: string): void {
    this.token = token;
  }

  // Очистка токена
  clearToken(): void {
    this.token = null;
  }

  // Базовые HTTP методы
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Метод для пагинированных запросов
  async getPaginated<T>(
    url: string, 
    params?: { page?: number; per_page?: number; [key: string]: any }
  ): Promise<PaginatedResponse<T>> {
    try {
      const response: AxiosResponse<PaginatedResponse<T>> = await this.client.get(url, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Обработка ошибок
  private handleError(error: any): AppError {
    if (error.response) {
      // Ошибка от сервера
      return {
        code: error.response.status.toString(),
        message: error.response.data?.message || 'Server error',
        details: error.response.data?.details,
      };
    } else if (error.request) {
      // Ошибка сети
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
      };
    } else {
      // Другие ошибки
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'Unknown error occurred',
      };
    }
  }
}

// Создание экземпляра API клиента
export const createApiClient = (baseURL: string): ApiClient => {
  return new ApiClient(baseURL);
};

// Дефолтный клиент (можно переопределить в каждом приложении)
export const apiClient = createApiClient(
  process.env.API_URL || 'http://localhost:8000/api'
);
