import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { db } from './prisma';
import type { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m';

export interface JWTPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginResult {
  needsVerification?: boolean;
  error?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    streakCount: number;
  };
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

export function generateJWT(payload: JWTPayload): string {
  return sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function verifyJWT(token: string): JWTPayload {
  try {
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    if (!decoded || typeof decoded !== 'object') {
      throw new Error('Invalid token payload');
    }
    if (!decoded.userId || !decoded.email || !decoded.firstName || !decoded.lastName) {
      throw new Error('Invalid token payload structure');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Alias for verifyJWT for backward compatibility
export const verifyToken = verifyJWT;

export function generateToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && decoded.exp) {
      return Date.now() >= decoded.exp * 1000;
    }
    return true;
  } catch {
    return true;
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const now = new Date();
    const user = await db.$queryRaw`
      SELECT id, email, "firstName", "lastName", "refreshTokenExpiresAt"
      FROM "User"
      WHERE "refreshToken" = ${refreshToken}
      AND "refreshTokenExpiresAt" > ${now}
      LIMIT 1
    `;

    if (!user || !Array.isArray(user) || user.length === 0) {
      return null;
    }

    const userData = user[0];
    return generateJWT({
      userId: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
    });
  } catch {
    return null;
  }
}
