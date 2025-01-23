import { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import type { User } from '@/types/user';
import { UserRole } from '@prisma/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: async () => {
    throw new Error('AuthContext not initialized');
  },
  logout: async () => {
    throw new Error('AuthContext not initialized');
  },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (session?.user) {
      setUser({
        ...session.user,
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as UserRole,
        firstName: '',
        lastName: '',
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        image: null,
        lastLogin: null,
        verificationStatus: 'pending',
        streakCount: 0,
        password: '',
      });
    } else {
      setUser(null);
    }
  }, [session]);

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Login failed'));
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Logout failed'));
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: status === 'loading',
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
