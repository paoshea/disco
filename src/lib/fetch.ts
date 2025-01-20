interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface ApiError {
  message: string;
  status?: number;
}

export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized - redirect to login
        window.location.href = '/login';
        throw new Error('Please log in to continue');
      }
      
      const error = (await response.json()) as ApiError;
      throw new Error(error.message || 'An error occurred');
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}
