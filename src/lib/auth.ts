import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { User as NextAuthUser } from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './prisma';
import type { Session, JWTPayload } from '@/types/auth';
import type { User as CustomUser } from '@/types/user';

interface TokenPayload {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

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

export const generateToken = async (
  payload: TokenUserPayload,
  secret: string = process.env.NEXTAUTH_SECRET || '',
  accessExpiresIn: number = 60 * 60, // 1 hour in seconds
  refreshExpiresIn: number = 30 * 24 * 60 * 60 // 30 days in seconds
): Promise<TokenPayload> => {
  const secretKey = new TextEncoder().encode(secret);

  // Generate access token
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + accessExpiresIn)
    .sign(secretKey);

  // Generate refresh token with minimal claims
  const refreshToken = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + refreshExpiresIn)
    .sign(secretKey);

  return {
    token,
    refreshToken,
    expiresIn: accessExpiresIn,
  };
};

export const generatePasswordResetToken = async (
  email: string,
  secret: string = process.env.NEXTAUTH_SECRET || '',
  expiresIn: number = 60 * 60 // 1 hour in seconds
): Promise<{ token: string; expiresAt: Date }> => {
  const secretKey = new TextEncoder().encode(secret);
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  const token = await new SignJWT({ email })
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
): Promise<{ user: JWTPayload } | null> => {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);

    if (!payload.sub || !payload.email || !payload.role || !payload.firstName) {
      return null;
    }

    return {
      user: {
        sub: payload.sub,
        email: payload.email as string,
        role: payload.role as string,
        firstName: payload.firstName as string,
      },
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
    const { payload } = await jwtVerify(token, secretKey);

    if (!payload.sub || !payload.email) {
      return null;
    }

    return {
      userId: payload.sub,
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
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(secretKey);
};

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
          throw new Error('Missing credentials');
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        });

        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isValid = await comparePasswords(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        } as User;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as User).role;
        token.firstName = (user as User).firstName;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      return {
        ...session,
        user: {
          id: token.id as string,
          email: token.email as string,
          role: token.role as string,
          firstName: token.firstName as string,
        },
      };
    },
  },
  session: {
    strategy: 'jwt',
  },
};

export async function getServerAuthSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('next-auth.session-token')?.value;

  if (!sessionToken) return null;

  try {
    const { payload } = await jwtVerify(
      sessionToken,
      new TextEncoder().encode(process.env.NEXTAUTH_SECRET || '')
    );

    return {
      user: {
        id: (payload.sub as string) || '',
        email: (payload.email as string) || '',
        role: (payload.role as string) || '',
        firstName: (payload.firstName as string) || '',
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
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.NEXTAUTH_SECRET || '')
    );

    if (!payload.exp) return null;

    return {
      user: {
        id: (payload.sub as string) || '',
        email: (payload.email as string) || '',
        role: (payload.role as string) || '',
        firstName: (payload.firstName as string) || '',
      },
      expires: new Date(payload.exp * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
