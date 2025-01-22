import { useAuthStore } from '@/stores/auth.store';
import type { LoginResult } from '@/types/auth';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token might be expired, logout the user
      useAuthStore.getState().logout();
    }
    throw new ApiError(response.status, await response.text());
  }

  return response;
}

export const api = {
  get: async <T>(url: string) => {
    const response = await fetchWithAuth(url);
    return response.json() as Promise<T>;
  },

  post: async <T>(url: string, data?: unknown) => {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json() as Promise<T>;
  },

  put: async <T>(url: string, data?: unknown) => {
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json() as Promise<T>;
  },

  delete: async <T>(url: string) => {
    const response = await fetchWithAuth(url, {
      method: 'DELETE',
    });
    return response.json() as Promise<T>;
  },
};

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  const data = await response.json();
  useAuthStore.getState().setToken(data.token);
  useAuthStore.getState().setUser(data.user);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout');
  } finally {
    useAuthStore.getState().logout();
  }
}

export async function refreshToken(): Promise<{ token: string }> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  const data = await response.json();
  useAuthStore.getState().setToken(data.token);
  return data;
}
