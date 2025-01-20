import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload as JoseJWTPayload } from 'jose';
import type { NextRequest } from 'next/server';
import type { User as NextAuthUser, Session } from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './prisma';
import type { JWTPayload } from '@/types/auth';
import crypto from 'crypto';

// Extend the built-in types
interface User extends NextAuthUser {
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

export const comparePasswords = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return compare(password, hash);
};

export const hashPassword = async (password: string): Promise<string> => {
  return hash(password, 10);
};

export const generateToken = async (user: User): Promise<string> => {
  // Create a payload that satisfies both our JWTPayload and jose's JWTPayload
  const payload: JWTPayload & { [key: string]: any } = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    sub: user.id // Add sub property, using user.id as per JWT standard
  };

  const secret = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'your-secret-key'
  );

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);

  return token;
};

export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
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

export async function generatePasswordResetToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = await hash(token, 10);
  
  // First find the user
  const user = await db.user.findUnique({
    where: { email }
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

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isValid = await comparePasswords(
          credentials.password,
          user.password
        );

        if (!isValid) {
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
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
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

export const getSession = async (
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
    console.error('Error getting session:', error);
    return null;
  }
};
