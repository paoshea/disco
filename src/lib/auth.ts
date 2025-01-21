import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcryptjs';
import crypto from 'crypto';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextRequest } from 'next/server';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    firstName: string;
    lastName: string;
    emailVerified?: Date | null;
    image?: string | null;
    verificationToken?: string | null;
    refreshToken?: string | null;
    refreshTokenExpiresAt?: Date | null;
    lastLogin?: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string | null;
    role: string;
  }
}

const accessTokenExpiresIn = 15 * 60; // 15 minutes
const refreshTokenExpiresIn = 7 * 24 * 60 * 60; // 7 days

export interface TokenUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  emailVerified?: Date | null;
  streakCount?: number;
}

export const comparePasswords = async (password: string, hash: string) => {
  return compare(password, hash);
};

export const hashPassword = async (password: string) => {
  return hash(password, 10);
};

export const generateTokens = async (user: TokenUser) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    sub: user.id,
    emailVerified: user.emailVerified ?? false,
    streakCount: user.streakCount ?? 0,
  };

  const secret = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'your-secret-key'
  );

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(Date.now() / 1000) + accessTokenExpiresIn)
    .sign(secret);

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

export const verifyToken = async (token: string) => {
  try {
    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || 'your-secret-key'
    );

    const { payload } = await jwtVerify(token, secret);

    return {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as string,
      name: payload.name as string | null,
      sub: payload.sub as string,
      emailVerified: payload.emailVerified === true,
      streakCount:
        typeof payload.streakCount === 'number' ? payload.streakCount : 0,
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};

export const verifyRefreshToken = async (token: string, secret: string) => {
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
  secret: string,
  expiresIn: number
) => {
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

export async function generatePasswordResetToken(email: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = await hash(token, 10);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  await prisma.passwordReset.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  return token;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(
        credentials: Record<'email' | 'password', string> | undefined
      ) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            firstName: true,
            lastName: true,
            emailVerified: true,
            image: true,
            verificationToken: true,
            refreshToken: true,
            refreshTokenExpiresAt: true,
            lastLogin: true,
          },
        });

        if (!user?.password) {
          return null;
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        // Create new object without password using Omit utility type
        const userWithoutPassword: Omit<typeof user, 'password'> = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
          image: user.image,
          verificationToken: user.verificationToken,
          refreshToken: user.refreshToken,
          refreshTokenExpiresAt: user.refreshTokenExpiresAt,
          lastLogin: user.lastLogin,
        };

        return userWithoutPassword;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    newUser: '/auth/new-user',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });
      }
      return token;
    },
    session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export const getServerAuthSession = async (req: NextRequest) => {
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
        name: session.name,
        role: session.role,
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
};

export const getSession = async (req: NextRequest) => {
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
        name: session.name,
        role: session.role,
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};
