import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import * as bcrypt from 'bcryptjs';
import type { Session } from '../types/auth';
import { db } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_SECRET || 'your-refresh-secret-key'
);

interface TokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthJWTPayload {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  type: 'access' | 'refresh' | 'reset';
  iat: number;
  exp: number;
}

interface PasswordResetResponse {
  token: string;
  expiresAt: Date;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function generateToken(
  payload: Omit<AuthJWTPayload, 'iat' | 'exp' | 'type'>
): Promise<TokenResponse> {
  // Access token valid for 1 day
  const token = await new jose.SignJWT({
    ...payload,
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  // Refresh token valid for 30 days
  const refreshToken = await new jose.SignJWT({
    userId: payload.userId,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(REFRESH_SECRET);

  return {
    token,
    refreshToken,
    expiresIn: 24 * 60 * 60, // 24 hours in seconds
  };
}

export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);

    if (
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string' ||
      typeof payload.firstName !== 'string' ||
      payload.type !== 'access'
    ) {
      return null;
    }

    const session: Session = {
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        firstName: payload.firstName,
      },
    };

    return session;
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, REFRESH_SECRET);

    if (typeof payload.userId !== 'string' || payload.type !== 'refresh') {
      return null;
    }

    return { userId: payload.userId };
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function getServerSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return null;
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export async function generatePasswordResetToken(
  email: string
): Promise<PasswordResetResponse | null> {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return null;
    }

    // Generate reset token using jose
    const token = await new jose.SignJWT({
      userId: user.id,
      email: user.email,
      type: 'reset' as const,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(JWT_SECRET);

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return {
      token,
      expiresAt,
    };
  } catch (error) {
    console.error('Error generating password reset token:', error);
    return null;
  }
}
