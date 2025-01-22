import { create } from 'zustand';
import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: user => set({ user, isAuthenticated: !!user }),
  setToken: token => set({ token }),
  setIsLoading: isLoading => set({ isLoading }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
