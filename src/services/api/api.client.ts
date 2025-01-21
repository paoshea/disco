import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import type { User } from '@/types/user';

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  success?: boolean;
  error?: string;
  message?: string;
  needsVerification?: boolean;
  expiresIn?: number;
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Initialize auth header from localStorage if token exists
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
}

// Add auth token to requests if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Always check localStorage for latest token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

interface ExtendedInternalAxiosRequestConfig
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Handle refresh token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedInternalAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await axios.post<AuthResponse>('/api/auth/refresh', {
          refreshToken,
        });

        const { token } = response.data;
        localStorage.setItem('token', token);

        // Update auth header
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure (e.g., logout user)
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
export type { AuthResponse };
