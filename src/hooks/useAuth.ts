import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '@/services/api/api.client';
import { z } from 'zod';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  streakCount: number;
  emailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

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
  createdAt: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  updatedAt: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
});

const loginResponseSchema = z.object({
  user: userSchema.optional(),
  error: z.string().optional(),
  needsVerification: z.boolean().optional(),
  token: z.string().optional(),
});

const registerResponseSchema = z.object({
  success: z.boolean().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  needsVerification: z.boolean().optional(),
  token: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().optional(),
  user: userSchema,
});

const updateProfileResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  user: userSchema.optional(),
});

export const useAuth = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      async login(email: string, password: string) {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post('/api/auth/login', {
            email,
            password,
          });

          const result = loginResponseSchema.safeParse(response.data);

          if (!result.success) {
            set({ error: 'Invalid response from server' });
            return { error: 'Invalid response from server' };
          }

          const data = result.data;

          if (data.error) {
            set({ error: data.error });
            return { error: data.error };
          }

          if (data.needsVerification) {
            return { needsVerification: true };
          }

          if (data.user && data.token) {
            set({ user: data.user, token: data.token });
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
          console.log('Making signup request...');
          const response = await apiClient.post('/api/auth/signup', data);
          console.log('Signup response:', response.data);
          
          const result = registerResponseSchema.safeParse(response.data);

          if (!result.success) {
            console.error('Invalid response schema:', result.error);
            // Don't fail on schema validation - the important data is there
            console.log('Attempting to proceed with available data...');
            const responseData = response.data;
            
            if (responseData.token && responseData.user) {
              // Store tokens and user data
              set({ 
                user: responseData.user,
                token: responseData.token,
                error: null,
              });

              // Set cookies for middleware
              document.cookie = `token=${responseData.token}; path=/; max-age=3600; SameSite=Lax`;
              if (responseData.refreshToken) {
                document.cookie = `refreshToken=${responseData.refreshToken}; path=/; max-age=86400; SameSite=Lax`;
              }

              // Configure API client with new token
              localStorage.setItem('token', responseData.token);
              apiClient.defaults.headers.common.Authorization = `Bearer ${responseData.token}`;
              
              if (responseData.refreshToken) {
                localStorage.setItem('refreshToken', responseData.refreshToken);
              }

              // Verify token is set
              const storedToken = localStorage.getItem('token');
              console.log('Token stored:', !!storedToken);
              console.log('Auth header:', apiClient.defaults.headers.common.Authorization);

              return { 
                success: true, 
                needsVerification: responseData.needsVerification 
              };
            }

            const error = 'Invalid response from server';
            set({ error });
            return { success: false, error };
          }

          const responseData = result.data;

          if (responseData.error) {
            console.error('Response contains error:', responseData.error);
            set({ error: responseData.error });
            return { success: false, error: responseData.error };
          }

          console.log('Setting auth state...');
          
          // Ensure we have required data
          if (!responseData.token || !responseData.user) {
            console.error('Missing required data from server');
            return { 
              success: false, 
              error: 'Invalid server response: missing token or user data' 
            };
          }

          // Store tokens and user data
          set({ 
            user: responseData.user,
            token: responseData.token,
            error: null,
          });

          console.log('Setting auth tokens...');
          
          // Set cookies for middleware
          document.cookie = `token=${responseData.token}; path=/; max-age=3600; SameSite=Lax`;
          if (responseData.refreshToken) {
            document.cookie = `refreshToken=${responseData.refreshToken}; path=/; max-age=86400; SameSite=Lax`;
          }

          // Configure API client with new token
          localStorage.setItem('token', responseData.token);
          apiClient.defaults.headers.common.Authorization = `Bearer ${responseData.token}`;
          
          if (responseData.refreshToken) {
            localStorage.setItem('refreshToken', responseData.refreshToken);
          }

          // Verify token is set
          const storedToken = localStorage.getItem('token');
          console.log('Token stored:', !!storedToken);
          console.log('Auth header:', apiClient.defaults.headers.common.Authorization);

          return { 
            success: true, 
            needsVerification: responseData.needsVerification 
          };
        } catch (error) {
          console.error('Registration error:', error);
          let message = 'Registration failed';
          
          if (error instanceof Error) {
            if (error.message.includes('409')) {
              message = 'An account with this email already exists';
            } else {
              message = error.message;
            }
          }
          
          set({ error: message });
          return { success: false, error: message };
        } finally {
          set({ isLoading: false });
        }
      },
      async updateProfile(data: UpdateProfileData) {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.patch('/api/auth/profile', data);
          const result = updateProfileResponseSchema.safeParse(response.data);

          if (!result.success) {
            set({ error: 'Invalid response from server' });
            return { success: false, error: 'Invalid response from server' };
          }

          const responseData = result.data;

          if (responseData.error) {
            set({ error: responseData.error });
            return { success: false, error: responseData.error };
          }

          if (responseData.user) {
            set({ user: responseData.user });
          }

          return { success: true };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to update profile';
          set({ error: message });
          return { success: false, error: message };
        } finally {
          set({ isLoading: false });
        }
      },
      async sendVerificationEmail() {
        set({ isLoading: true, error: null });
        try {
          await apiClient.post('/api/auth/send-verification');
          return { success: true };
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to send verification email';
          set({ error: message });
          return { success: false, error: message };
        } finally {
          set({ isLoading: false });
        }
      },
      async requestPasswordReset(email: string) {
        set({ isLoading: true, error: null });
        try {
          await apiClient.post('/api/auth/request-reset', {
            email,
          });
          return { success: true };
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to request password reset';
          set({ error: message });
          return { success: false, error: message };
        } finally {
          set({ isLoading: false });
        }
      },
      async resetPassword(token: string, password: string) {
        set({ isLoading: true, error: null });
        try {
          await apiClient.post('/api/auth/reset-password', {
            token,
            password,
          });
          return { success: true };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to reset password';
          set({ error: message });
          return { success: false, error: message };
        } finally {
          set({ isLoading: false });
        }
      },
      set,
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
