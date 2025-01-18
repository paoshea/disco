import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginResult } from '@/lib/auth';
import { api } from '@/lib/api';
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
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
};

async function loginImpl(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    const data = await api.post<LoginResult>('/api/auth/login', {
      email,
      password,
    });
    const result = loginResponseSchema.safeParse(data);

    if (!result.success) {
      return {
        error: 'Invalid response from server',
      };
    }

    return result.data;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An error occurred during login' };
  }
}

function logoutImpl(): void {
  // Clear any stored tokens or user data
  localStorage.removeItem('auth-storage');
}

export const useAuth = create<AuthStore>()(
  persist(
    set => ({
      user: null,
      token: null,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const result = await loginImpl(email, password);
          if (result.user && result.token) {
            set({ user: result.user, token: result.token, isLoading: false });
          } else {
            set({ isLoading: false });
          }
          return result;
        } catch (error) {
          set({ isLoading: false });
          return { error: 'An error occurred during login' };
        }
      },
      logout: () => {
        logoutImpl();
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({ user: state.user, token: state.token }),
    }
  )
);
