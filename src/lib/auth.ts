import type { NextAuthOptions } from 'next-auth';
import type { Session } from 'next-auth';
import { db } from './prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import * as bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import type { User } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
    };
  }

  interface User {
    id: string;
    email: string;
    role: string;
  }
}

export const comparePasswords = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const generateToken = async (
  payload: Record<string, unknown>,
  secret: string,
  expiresIn: number = 24 * 60 * 60 // 24 hours in seconds
): Promise<string> => {
  const secretKey = new TextEncoder().encode(secret);
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(secretKey);
};

export const generatePasswordResetToken = async (
  email: string,
  secret: string = process.env.NEXTAUTH_SECRET || '',
  expiresIn: number = 60 * 60 // 1 hour in seconds
): Promise<{ token: string; expiresAt: Date }> => {
  const secretKey = new TextEncoder().encode(secret);
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  
  const token = await new jose.SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secretKey);

  return {
    token,
    expiresAt,
  };
};

export const verifyToken = async (
  token: string,
  secret: string = process.env.NEXTAUTH_SECRET || ''
): Promise<{ user: { id: string; email: string; role: string } } | null> => {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, secretKey);
    
    if (!payload.sub || !payload.email || !payload.role) {
      return null;
    }

    return {
      user: {
        id: payload.sub as string,
        email: payload.email as string,
        role: payload.role as string,
      }
    };
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
    const { payload } = await jose.jwtVerify(token, secretKey);
    
    if (!payload.sub || !payload.email) {
      return null;
    }

    return {
      userId: payload.sub as string,
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
  return new jose.SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(secretKey);
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            emailVerified: true,
            role: true,
          },
        });

        if (!user) {
          throw new Error('Invalid credentials');
        }

        if (!user.password) {
          throw new Error('Please reset your password');
        }

        const isValid = await comparePasswords(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email first');
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || '';
        session.user.email = token.email || '';
        session.user.role = (token.role as string) || '';
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
};

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('next-auth.session-token')?.value;

  if (!sessionToken) return null;

  try {
    const { payload } = await jose.jwtVerify(
      sessionToken,
      new TextEncoder().encode(process.env.NEXTAUTH_SECRET || '')
    );

    return {
      user: {
        id: (payload.sub as string) || '',
        email: (payload.email as string) || '',
        role: (payload.role as string) || '',
      },
      expires: new Date((payload.exp as number) * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error verifying session token:', error);
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('next-auth.session-token')?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode(process.env.NEXTAUTH_SECRET || '')
    );

    if (!payload.exp) return null;

    return {
      user: {
        id: (payload.sub as string) || '',
        email: (payload.email as string) || '',
        role: (payload.role as string) || '',
      },
      expires: new Date(payload.exp * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
