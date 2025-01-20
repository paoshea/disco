import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { db } from './prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import * as bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import type { User } from '@prisma/client';
import { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';
import { getServerSession as nextAuthGetServerSession } from 'next-auth/next';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: string;
    };
    expires: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email?: string;
    role?: string;
  }
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
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

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.JWT_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export async function generateToken(
  payload: Omit<AuthJWTPayload, 'iat' | 'exp' | 'type'>
): Promise<TokenResponse> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 24 * 60 * 60; // 24 hours

  const accessToken = await new jose.SignJWT({
    ...payload,
    type: 'access',
    iat,
    exp,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(JWT_SECRET);

  const refreshToken = await new jose.SignJWT({
    ...payload,
    type: 'refresh',
    iat,
    exp: iat + 30 * 24 * 60 * 60, // 30 days
  })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(JWT_SECRET);

  return {
    token: accessToken,
    refreshToken,
    expiresIn: exp,
  };
}

export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const payload = await jose.jwtVerify(
      token,
      JWT_SECRET
    ) as unknown as AuthJWTPayload;

    const user = await db.user.findUnique({
      where: { id: payload.userId as string },
    });

    if (!user) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    
    if (payload.type !== 'refresh') {
      return null;
    }

    return { userId: payload.userId as string };
  } catch {
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
  return nextAuthGetServerSession(authOptions);
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('next-auth.session-token')?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export async function getCurrentUser(): Promise<Session['user'] | undefined> {
  const session = await getSession();
  return session?.user;
}

export async function getToken(cookieStore: RequestCookies): Promise<string | undefined> {
  return cookieStore.get('next-auth.session-token')?.value;
}

export async function generatePasswordResetToken(
  email: string
): Promise<PasswordResetResponse | null> {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60; // 1 hour

  const token = await new jose.SignJWT({
    userId: user.id,
    email: user.email,
    type: 'reset',
    iat,
    exp,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(JWT_SECRET);

  return {
    token,
    expiresAt: new Date(exp * 1000),
  };
}
