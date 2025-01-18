import { User } from './user';

export interface SignupInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ResetPasswordInput {
  email: string;
  token: string;
  newPassword: string;
}

export interface VerifyEmailInput {
  email: string;
  token: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  type?: string;
  iat?: number;
  exp?: number;
}

export interface Session {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  id: string;
  email: string;
  role: string;
}

export interface LoginResult {
  success?: boolean;
  token?: string;
  error?: string;
  needsVerification?: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    streakCount: number;
  };
}
