import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';

// Extend the InternalAxiosRequestConfig type to include _retry
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: '',  // Empty baseURL since we're using absolute paths
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Add request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Don't add token for auth endpoints except /me, /refresh, and /profile
    const isAuthEndpoint = config.url?.includes('/api/auth/');
    const needsToken = isAuthEndpoint && 
      (config.url?.endsWith('/me') || 
       config.url?.includes('/refresh') || 
       config.url?.includes('/profile'));

    // Add token for protected routes
    if (typeof window !== 'undefined' && (needsToken || !isAuthEndpoint)) {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Log request for debugging
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    
    // Only handle browser-specific operations if we're in a browser environment
    if (typeof window !== 'undefined' && originalRequest) {
      // Handle 401 errors with token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          try {
            const token = await new Promise<string>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await axios.post('/api/auth/refresh', {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Update the authorization header
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          // Process queued requests
          processQueue(null, token);
          
          // Retry the original request
          return axios(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle other status codes
      if (error.response) {
        const status = error.response.status;
        const url = error.config?.url;
        
        switch (status) {
          case 404:
            console.error(`Resource not found: ${url}`);
            break;
          case 500:
            console.error('Server error:', error.response.data);
            break;
        }
      } else if (error.code === 'ERR_NETWORK') {
        console.error('Network error - please check your connection');
      }
    }
    return Promise.reject(error);
  }
);
