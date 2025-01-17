import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Define API response types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const apiError: ApiError = {
        status: error.response.status,
        message: error.response.data.message || 'An error occurred',
        errors: error.response.data.errors,
      };
      return Promise.reject(apiError);
    } else if (error.request) {
      // The request was made but no response was received
      const apiError: ApiError = {
        status: 0,
        message: 'No response received from server',
      };
      return Promise.reject(apiError);
    } else {
      // Something happened in setting up the request that triggered an Error
      const apiError: ApiError = {
        status: 0,
        message: error.message || 'Request setup error',
      };
      return Promise.reject(apiError);
    }
  }
);

export { api };
