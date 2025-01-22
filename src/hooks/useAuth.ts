import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '@/services/api/api.client';
import { z } from 'zod';
import type {
  LoginResponse,
  RegisterResponse,
  UpdateProfileResponse,
} from '@/types/auth';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{
    success?: boolean;
    error?: string;
    needsVerification?: boolean;
  }>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<{
    success: boolean;
    error?: string;
    needsVerification?: boolean;
  }>;
  requestPasswordReset: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    token: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (
    data: UpdateProfileData
  ) => Promise<{ success: boolean; error?: string }>;
  sendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  set: (state: Partial<AuthState>) => void;
}

export interface LoginResult {
  success?: boolean;
  error?: string;
  needsVerification?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
  streakCount: z.number(),
  emailVerified: z.boolean(),
  name: z.string(),
  lastActive: z.date(),
  verificationStatus: z.enum(['pending', 'verified', 'rejected']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const authResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
  needsVerification: z.boolean().optional(),
  expiresIn: z.number().optional(),
});

export const useAuth = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      async login(email, password) {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<LoginResponse>(
            '/api/auth/login',
            {
              email,
              password,
            }
          );

          const result = authResponseSchema.safeParse(response.data);
          if (!result.success) {
            console.error('Invalid response schema:', result.error);
            set({ error: 'Invalid response from server' });
            return { error: 'Invalid response from server' };
          }

          const { token, user, needsVerification } = result.data;

          if (needsVerification) {
            return { needsVerification: true };
          }

          if (user && token) {
            set({ user, token });
            return { success: true };
          }

          set({ error: 'Login failed' });
          return { error: 'Login failed' };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Login failed';
          set({ error: message });
          return { error: message };
        } finally {
          set({ isLoading: false });
        }
      },
      async logout() {
        try {
          await apiClient.post('/api/auth/logout');
        } finally {
          set({ user: null, token: null });
        }
      },
      async register(data: RegisterData) {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<RegisterResponse>(
            '/api/auth/signup',
            data
          );
          const result = authResponseSchema.safeParse(response.data);

          if (!result.success) {
            console.error('Invalid response schema:', result.error);
            set({ error: 'Invalid response from server' });
            return { success: false, error: 'Invalid response from server' };
          }

          const { token, user, needsVerification } = result.data;

          set({ user, token });

          // Set cookies for middleware
          document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Lax`;

          return {
            success: true,
            needsVerification: needsVerification || false,
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Registration failed';
          set({ error: message });
          return { success: false, error: message };
        } finally {
          set({ isLoading: false });
        }
      },
      async updateProfile(data) {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.patch<UpdateProfileResponse>(
            '/api/auth/profile',
            data
          );

          const result = userSchema.safeParse(response.data.user);
          if (!result.success) {
            console.error('Invalid user data:', result.error);
            set({ error: 'Invalid response from server' });
            return { success: false, error: 'Invalid response from server' };
          }

          set({ user: result.data });
          return { success: true };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Profile update failed';
          set({ error: message });
          return { success: false, error: message };
        } finally {
          set({ isLoading: false });
        }
      },
      async sendVerificationEmail() {
        set({ isLoading: true, error: null });
        try {
          const token = useAuth.getState().token;
          await apiClient.post('/api/auth/send-verification-email', {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          return { success: true };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to send verification email';
          set({ error: message });
          return { success: false, error: message };
        } finally {
          set({ isLoading: false });
        }
      },
      async verifyEmail(token: string) {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post('/api/auth/verify-email', {
            token,
          });

          const result = z.object({
            user: userSchema,
          }).safeParse(response.data);

          if (!result.success) {
            console.error('Invalid response schema:', result.error);
            set({ error: 'Invalid response from server' });
            return { success: false, error: 'Invalid response from server' };
          }

          const { user } = result.data;
          set({ user });
          return { success: true };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to verify email';
          set({ error: message });
          return { success: false, error: message };
        } finally {
          set({ isLoading: false });
        }
      },
      async requestPasswordReset(email) {
        try {
          await apiClient.post('/api/auth/request-reset', { email });
          return { success: true };
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to request password reset';
          return { success: false, error: message };
        }
      },
      async resetPassword(token, password) {
        try {
          await apiClient.post('/api/auth/reset-password', {
            token,
            password,
          });
          return { success: true };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to reset password';
          return { success: false, error: message };
        }
      },
      set,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
