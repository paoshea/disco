import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface JWTPayload extends jose.JWTPayload {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  [key: string]: string | string[] | number | boolean | null | undefined;
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

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hash).toString('base64');
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
}

// For JWT tokens (auth tokens)
export async function generateToken(payload: JWTPayload): Promise<string> {
  const alg = 'HS256';
  const jwtPayload: jose.JWTPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  };

  const jwt = await new jose.SignJWT(jwtPayload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
  return jwt;
}

// For verification tokens (email verification, password reset)
export function generateVerificationToken(): string {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return Buffer.from(buffer).toString('base64url');
}

export async function generateRefreshToken(
  payload: JWTPayload
): Promise<string> {
  const alg = 'HS256';
  const jwtPayload: jose.JWTPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  };

  const jwt = await new jose.SignJWT(jwtPayload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
  return jwt;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const customPayload = payload as unknown as JWTPayload;

    // Verify that all required fields are present
    if (
      !customPayload.userId ||
      !customPayload.email ||
      !customPayload.role ||
      !customPayload.firstName
    ) {
      return null;
    }

    return customPayload;
  } catch (error) {
    return null;
  }
}

// Alias for verifyToken for backward compatibility
export const verifyJWT = verifyToken;

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session-token')?.value;

  if (!token) return null;

  try {
    const decoded = await verifyToken(token);
    if (!decoded) return null;

    return {
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
}
