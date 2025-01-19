import jwt from 'jsonwebtoken';
import { db } from './prisma';
import { User } from '@prisma/client';
import { JWT_SECRET } from './config';

const ACCESS_TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '30d';
const PASSWORD_RESET_EXPIRY = '1h';

export interface JWTPayload {
  userId: string;
  email: string;
  firstName: string;
  role: string;
  type?: 'refresh';
  iat?: number;
  exp?: number;
}

export async function generateTokens(user: User) {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    role: user.role,
  };

  const accessToken = await new Promise<string>((resolve, reject) => {
    jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      },
      (err, token) => {
        if (err || !token) {
          reject(err ?? new Error('Failed to generate token'));
        } else {
          resolve(token);
        }
      }
    );
  });

  const refreshToken = await new Promise<string>((resolve, reject) => {
    jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY },
      (err, token) => {
        if (err || !token) {
          reject(err ?? new Error('Failed to generate refresh token'));
        } else {
          resolve(token);
        }
      }
    );
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 24 * 60 * 60, // 24 hours in seconds
  };
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = await new Promise<JWTPayload>((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) =>
        err ? reject(err) : resolve(decoded as JWTPayload)
      );
    });

    if (decoded.type === 'refresh') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<string | null> {
  try {
    const decoded = await new Promise<JWTPayload>((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) =>
        err ? reject(err) : resolve(decoded as JWTPayload)
      );
    });

    if (decoded.type !== 'refresh') {
      return null;
    }
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const decoded = await verifyToken(token);
  if (!decoded?.userId) {
    return null;
  }

  try {
    return await db.user.findUnique({
      where: { id: decoded.userId },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function generatePasswordResetToken(
  email: string
): Promise<string | null> {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return null;
    }

    const token = await new Promise<string>((resolve, reject) => {
      jwt.sign(
        {
          userId: user.id,
          email: user.email,
          type: 'reset',
        },
        JWT_SECRET,
        { expiresIn: PASSWORD_RESET_EXPIRY },
        (err, token) => {
          if (err || !token) {
            reject(err ?? new Error('Failed to generate reset token'));
          } else {
            resolve(token);
          }
        }
      );
    });

    // Store the reset token in the database
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResets: {
          create: {
            token,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          },
        },
      },
    });

    return token;
  } catch (error) {
    console.error('Error generating password reset token:', error);
    return null;
  }
}
