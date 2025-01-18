import { create } from 'zustand';
import type { LoginResult } from '@/lib/auth';

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

async function loginImpl(email: string, password: string): Promise<LoginResult> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      error: result.message || 'An error occurred during login',
    };
  }

  if (result.needsVerification) {
    return { needsVerification: true };
  }

  if (result.user && result.token) {
    return {
      user: result.user,
      token: result.token,
    };
  }

  return {
    error: 'Invalid response from server',
  };
}

function logoutImpl(): void {
  localStorage.removeItem('token');
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  login: async (email: string, password: string): Promise<LoginResult> => {
    set({ isLoading: true });
    let result: LoginResult;
    try {
      result = await loginImpl(email, password);
      if (result.user) {
        set({ user: result.user });
      }
    } catch (error) {
      result = {
        error: error instanceof Error ? error.message : 'An error occurred during login',
      };
    } finally {
      set({ isLoading: false });
    }
    return result;
  },
  logout: () => {
    logoutImpl();
    set({ user: null });
  },
}));
