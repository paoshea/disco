import { User as OriginalUser } from './user';
import type { Session as NextAuthSession } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
    };
  }

  interface User {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface CustomJWT extends DefaultJWT {
  user: AuthUser;
}

export interface Session extends NextAuthSession {
  user: AuthUser & {
    name: string | null; // Required by NextAuth
  };
}

export type AuthStatus = 'authenticated' | 'loading' | 'unauthenticated';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  sub: string; // Add sub to match JWT interface
  emailVerified: boolean;
  streakCount: number;
}

export interface JoseJWTPayload {
  [key: string]: unknown;
}

export interface LoginResult {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  bio?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  role?: string;
  streakCount?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface AuthResponse {
  success: boolean;
  error?: Error;
}

export interface SignupInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  email: string;
  token: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface VerifyEmailInput {
  email: string;
  token: string;
}

export interface LoginResponse {
  user?: User;
  error?: string;
  needsVerification?: boolean;
  token?: string;
}

export type RegisterResponse = AuthResponse;

export interface UpdateProfileResponse {
  success: boolean;
  error?: string;
  user?: User;
}

export interface PasswordResetResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface VerificationResponse {
  success: boolean;
  error?: string;
  message?: string;
}
