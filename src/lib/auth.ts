import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import type { JWTPayload, Session } from '../types/auth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

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

export async function generateToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>
): Promise<string> {
  const jwt = await new jose.SignJWT({
    ...payload,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET);
  return jwt;
}

export async function generateRefreshToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>
): Promise<string> {
  const jwt = await new jose.SignJWT({
    ...payload,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  return jwt;
}

export async function generatePasswordResetToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>
): Promise<string> {
  const jwt = await new jose.SignJWT({
    ...payload,
    type: 'password-reset',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET);
  return jwt;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);

    // Type check and conversion
    if (
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string' ||
      typeof payload.firstName !== 'string'
    ) {
      return null;
    }

    const customPayload: JWTPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      firstName: payload.firstName,
      type: payload.type as string | undefined,
      iat: payload.iat,
      exp: payload.exp,
    };

    return customPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

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
