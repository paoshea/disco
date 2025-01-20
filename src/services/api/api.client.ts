import axios from 'axios';

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
  (config) => {
    // Always check localStorage for latest token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('Attempting to refresh token...');
        // Try to refresh token
        const response = await axios.post('/api/auth/refresh', {
          refreshToken,
        });

        if (response.data?.token) {
          console.log('Token refreshed successfully');
          // Update tokens
          localStorage.setItem('token', response.data.token);
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }

          // Update Authorization header
          apiClient.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;

          // Verify token is set
          console.log('New auth header:', apiClient.defaults.headers.common.Authorization);

          // Retry original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear auth state on refresh failure
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        delete apiClient.defaults.headers.common.Authorization;
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export { apiClient };
