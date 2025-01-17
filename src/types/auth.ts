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
