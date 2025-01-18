import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';

// Get the base URL from environment variables or use relative path for Next.js API routes
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Handle specific HTTP errors
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Handle forbidden
          console.error('Access forbidden:', error.response.data);
          break;
        case 404:
          // Handle not found
          console.error('Resource not found:', error.response.data);
          break;
        case 500:
          // Handle server error
          console.error('Server error:', error.response.data);
          break;
      }
    } else if (error.request) {
      // Handle network errors
      console.error('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);
