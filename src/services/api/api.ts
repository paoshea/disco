import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface ApiError extends Error {
  status?: number;
  data?: any;
}

interface ApiConfig extends AxiosRequestConfig {
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
        return Promise.reject(this.handleError(error));
      }
    );

    this.instance.interceptors.response.use(
      response => response,
      error => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.instance.get<T>(url, config);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.instance.post<T>(url, data, config);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.instance.put<T>(url, data, config);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.instance.delete<T>(url, config);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = new Error(
        error.response?.data?.message || error.message || 'An unexpected error occurred'
      );
      apiError.status = error.response?.status;
      apiError.data = error.response?.data;
      return apiError;
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('An unexpected error occurred');
  }
}

export const api = new ApiService();
