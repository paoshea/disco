import { create } from 'zustand';
import type { LoginResult } from '@/lib/auth';
import { z } from 'zod';

const loginResponseSchema = z.object({
  user: z
    .object({
      id: z.string(),
      email: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      streakCount: z.number(),
    })
    .optional(),
  error: z.string().optional(),
  needsVerification: z.boolean().optional(),
  token: z.string().optional(),
});

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  streakCount: number;
}

type AuthStore = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
};

async function loginImpl(
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

  const data = await response.json();
  const result = loginResponseSchema.safeParse(data);

  if (!result.success) {
    return {
      error: 'Invalid response from server',
    };
  }

  const parsedData = result.data;

  if (!response.ok) {
    return {
      error: parsedData.error || 'An error occurred during login',
    };
  }

  if (parsedData.needsVerification) {
    return { needsVerification: true };
  }

  if (parsedData.user && parsedData.token) {
    return {
      user: parsedData.user,
      token: parsedData.token,
    };
  }

  return {
    error: 'Invalid response from server',
  };
}

function logoutImpl(): void {
  localStorage.removeItem('token');
}

export const useAuth = create<AuthStore>(set => ({
  user: null,
  isLoading: false,
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const result = await loginImpl(email, password);
      if (result.user) {
        set({ user: result.user });
      }
      return result;
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred during login',
      };
    } finally {
      set({ isLoading: false });
    }
  },
  logout: () => {
    logoutImpl();
    set({ user: null });
  },
}));
