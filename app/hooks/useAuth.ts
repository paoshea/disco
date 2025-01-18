import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoginResult } from '@/hooks/useAuth';
import { apiClient } from '@/services/api/api.client';
import { z } from 'zod';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  streakCount: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  set: (state: Partial<AuthState>) => void;
}

const loginResponseSchema = z.object({
  user: z
    .object({
      id: z.string(),
      email: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      role: z.string(),
      streakCount: z.number(),
    })
    .optional(),
  error: z.string().optional(),
  needsVerification: z.boolean().optional(),
  token: z.string().optional(),
});

const useAuth = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      set: state => set(state),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const data = await apiClient.post('/api/auth/login', {
            email,
            password,
          });
          const result = loginResponseSchema.safeParse(data);

          if (!result.success) {
            throw new Error('Invalid response from server');
          }

          if (result.data.user && result.data.token) {
            set({
              user: result.data.user,
              token: result.data.token,
              isLoading: false,
            });
            return { success: true };
          } else if (result.data.needsVerification) {
            set({ isLoading: false });
            return { needsVerification: true };
          } else if (result.data.error) {
            set({ isLoading: false, error: result.data.error });
            return { error: result.data.error };
          }

          throw new Error('Invalid response format');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An error occurred during login';
          set({
            error: errorMessage,
            isLoading: false,
          });
          return { error: errorMessage };
        }
      },

      logout: async () => {
        try {
          await apiClient.post('/api/auth/logout');
          set({ user: null, token: null });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export default useAuth;
