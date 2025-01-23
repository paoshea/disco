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
    expires: string;
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
  expires: string;
}

export type AuthStatus = 'authenticated' | 'loading' | 'unauthenticated';

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
  role: string;
  streakCount?: number;
  bio?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  lastActive?: string;
  verificationStatus?: 'pending' | 'verified';
  preferences?: UserPreferences;
}

export interface UserPreferences {
  notifications: {
    matches: boolean;
    messages: boolean;
    events: boolean;
    safety: boolean;
    email?: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showLocation: boolean;
    showActivity: boolean;
  };
  safety: {
    blockUnverifiedUsers: boolean;
    enableSafetyCheck: boolean;
    reportThreshold: number;
  };
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
  message?: string;
  needsVerification?: boolean;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: User;
}

export interface LoginResponse extends AuthResponse {
  user: User;
  token: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  needsVerification?: boolean;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
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
