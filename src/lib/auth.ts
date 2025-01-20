import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcrypt';
import crypto from 'crypto';
import { db } from './prisma';
import type { Session } from 'next-auth';
import type { NextRequest } from 'next/server';
import type { JWTPayload } from '@/types/auth';
import type { SessionStrategy } from 'next-auth';

// Extend the built-in types
interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface TokenUserPayload {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

const accessTokenExpiresIn = 15 * 60; // 15 minutes
const refreshTokenExpiresIn = 7 * 24 * 60 * 60; // 7 days

export const comparePasswords = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return compare(password, hash);
};

export const hashPassword = async (password: string): Promise<string> => {
  return hash(password, 10);
};

export const generateTokens = async (
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    emailVerified?: boolean;
    streakCount?: number;
  }
): Promise<{
  token: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}> => {
  // Create a payload that satisfies both our JWTPayload and jose's JWTPayload
  const payload: JWTPayload & { [key: string]: any } = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    sub: user.id, // Add sub property, using user.id as per JWT standard
    emailVerified: user.emailVerified ?? false,
    streakCount: user.streakCount ?? 0,
  };

  const secret = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'your-secret-key'
  );

  // Generate access token
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(Date.now() / 1000) + accessTokenExpiresIn)
    .sign(secret);

  // Generate refresh token with a different type
  const refreshPayload = {
    ...payload,
    type: 'refresh',
  };

  const refreshToken = await new SignJWT(refreshPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(Date.now() / 1000) + refreshTokenExpiresIn)
    .sign(secret);

  return {
    token,
    refreshToken,
    accessTokenExpiresIn,
    refreshTokenExpiresIn,
  };
};

export const verifyToken = async (
  token: string
): Promise<JWTPayload | null> => {
  try {
    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    );

    const { payload } = await jwtVerify(token, secret);

    // Verify the payload has all required fields
    if (
      typeof payload.id === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.role === 'string' &&
      typeof payload.firstName === 'string' &&
      typeof payload.lastName === 'string' &&
      typeof payload.sub === 'string'
    ) {
      return {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        firstName: payload.firstName,
        lastName: payload.lastName,
        sub: payload.sub,
        emailVerified: payload.emailVerified === true,
        streakCount:
          typeof payload.streakCount === 'number' ? payload.streakCount : 0,
      };
    }
    return null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};

export const verifyRefreshToken = async (
  token: string,
  secret: string = process.env.NEXTAUTH_SECRET || ''
): Promise<{ userId: string; email: string } | null> => {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);

    if (payload.type !== 'refresh') {
      return null;
    }

    return {
      userId: payload.id as string,
      email: payload.email as string,
    };
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    return null;
  }
};

export const generateRefreshToken = async (
  userId: string,
  email: string,
  secret: string = process.env.NEXTAUTH_SECRET || '',
  expiresIn: number = 7 * 24 * 60 * 60 // 7 days in seconds
): Promise<string> => {
  const secretKey = new TextEncoder().encode(secret);
  const token = await new SignJWT({
    id: userId,
    email,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(secretKey);

  return token;
};

export async function generatePasswordResetToken(
  email: string
): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = await hash(token, 10);

  // First find the user
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Store the token in the database with expiration
  await db.passwordReset.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  return token;
}

export const authOptions = {
  // Configure JWT
  jwt: async ({ token, user }: { token: Record<string, unknown>; user?: Record<string, unknown> }) => {
    if (user) {
      await Promise.resolve(); // Add await to satisfy require-await
      token.id = user.id;
      token.email = user.email;
      token.role = user.role;
      token.firstName = user.firstName;
      token.lastName = user.lastName;
    }
    return token;
  },

  providers: [
    {
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: { email: string; password: string } | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await comparePasswords(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    },
  ],
  session: {
    strategy: 'jwt' as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
};

export const getServerAuthSession = async (
  req: NextRequest
): Promise<Session | null> => {
  const sessionToken = req.cookies.get('next-auth.session-token');

  if (!sessionToken) {
    return null;
  }

  try {
    const session = await verifyToken(sessionToken.value);
    if (!session) {
      return null;
    }

    return {
      user: {
        id: session.id,
        email: session.email,
        role: session.role,
        firstName: session.firstName,
        lastName: session.lastName,
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
};

export const getSession = async (req: NextRequest): Promise<Session | null> => {
  const sessionToken = req.cookies.get('next-auth.session-token');

  if (!sessionToken) {
    return null;
  }

  try {
    const session = await verifyToken(sessionToken.value);
    if (!session) {
      return null;
    }

    return {
      user: {
        id: session.id,
        email: session.email,
        role: session.role,
        firstName: session.firstName,
        lastName: session.lastName,
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};
