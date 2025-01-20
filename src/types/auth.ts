import { User } from './user';
import type { DefaultSession, DefaultUser } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

// Extend next-auth types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      role: string;
      firstName: string;
    };
  }

  interface User extends DefaultUser {
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
  }
}

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
  id: string; // user id (same as sub)
  sub: string; // subject (user id)
  email: string;
  role: string;
  firstName: string;
  type?: string;
  iat?: number;
  exp?: number;
}
