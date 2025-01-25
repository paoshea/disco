import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '@/services/api/api.client';
import { z } from 'zod';
import type {
  RegisterResponse,
  UpdateProfileResponse,
} from '@/types/auth';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null; // Added refreshToken to state
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
  set: (state: Partial<AuthState>) => void;
  refreshTokens: () => Promise<boolean>;
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
  refreshToken: z.string().optional(), // Added refreshToken to schema
  needsVerification: z.boolean().optional(),
  expiresIn: z.number().optional(),
});

export const useAuth = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      refreshToken: null, // Initialize refreshToken
      isLoading: false,
      error: null,
      async login(email, password) {
        set({ isLoading: true, error: null });
        try {
          interface LoginApiResponse {
            token: string;
            user: User;
            refreshToken?: string;
            needsVerification?: boolean;
          }

          const response = await apiClient.post<LoginApiResponse>(
            '/api/auth/login',
            {
              email,
              password,
            }
          );

          const parsedData = response.data as LoginApiResponse;
          const result = authResponseSchema.safeParse(parsedData);
          if (!result.success) {
            console.error('Invalid response schema:', result.error);
            set({ error: 'Invalid response from server' });
            return { error: 'Invalid response from server' };
          }

          const { token, user, refreshToken, needsVerification } = result.data;

          if (needsVerification) {
            return { needsVerification: true };
          }

          if (user && token) {
            set({ user, token, refreshToken }); // Set refreshToken
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
          set({ user: null, token: null, refreshToken: null }); // Clear refreshToken
        }
      },
      async refreshTokens() {
        try {
          const response = await apiClient.post('/api/auth/refresh');
          const { token, refreshToken } = response.data;
          set({ token, refreshToken });
          return true;
        } catch (error) {
          return false;
        }
      },
      async register(data: RegisterData) {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<RegisterResponse>(
            '/api/auth/signup',
            data
          );
          const parsedData = response.data as unknown;
          const result = authResponseSchema.safeParse(parsedData);

          if (!result.success) {
            console.error('Invalid response schema:', result.error);
            set({ error: 'Invalid response from server' });
            return { success: false, error: 'Invalid response from server' };
          }

          const { token, user, refreshToken, needsVerification } = result.data; // Extract refreshToken

          if (token && user) {
            // Check if token and user exist
            set({ user, token, refreshToken }); // Set refreshToken
            // Set cookies for middleware -  Consider more secure cookie handling
            document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Lax`;
          } else {
            set({ error: 'Registration failed: Missing token or user data' });
            return {
              success: false,
              error: 'Registration failed: Missing token or user data',
            };
          }

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
        try {
          await apiClient.post('/api/auth/send-verification');
          return { success: true };
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to send verification email';
          return { success: false, error: message };
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
