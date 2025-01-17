import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface ApiErrorResponse {
  message: string;
  code?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiConfig extends AxiosRequestConfig {
  baseURL: string;
  timeout: number;
  headers: {
    'Content-Type': string;
    Authorization?: string;
  };
}

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    const config: ApiConfig = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    this.instance = axios.create(config);

    this.instance.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      response => {
        return response;
      },
      (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      return await this.instance.get<ApiResponse<T>>(url, config);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      return await this.instance.post<ApiResponse<T>, AxiosResponse<ApiResponse<T>>, D>(
        url,
        data,
        config
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      return await this.instance.put<ApiResponse<T>, AxiosResponse<ApiResponse<T>>, D>(
        url,
        data,
        config
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    try {
      return await this.instance.delete<ApiResponse<T>>(url, config);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const response = error.response?.data as ApiErrorResponse | undefined;
      return {
        message: response?.message ?? 'An unexpected error occurred',
        code: response?.code,
        status: error.response?.status ?? 500,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        status: 500,
      };
    }

    return {
      message: 'An unexpected error occurred',
      status: 500,
    };
  }
}

export const apiService = new ApiService();
