import { User } from './user';
import type { DefaultSession } from 'next-auth';

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
  refreshToken?: string;
  expiresIn?: number;
}

export interface LoginResult {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
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
  sub: string; // subject (user id)
  email: string;
  role: string;
  firstName: string;
  type?: string;
  iat?: number;
  exp?: number;
}

export interface Session extends DefaultSession {
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
  };
}
