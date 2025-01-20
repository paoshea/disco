import { User } from './user';
import type { DefaultSession, DefaultUser } from 'next-auth';
import type { Session as NextAuthSession } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

// Extend next-auth types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      role: string;
      firstName: string;
      lastName: string;
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
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  }
}

export interface Session extends NextAuthSession {
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
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
