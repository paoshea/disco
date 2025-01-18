import { useAuth } from '@/app/hooks/useAuth';

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
  const authStore = useAuth.getState();
  const token = authStore.token;

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
      authStore.logout();
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
