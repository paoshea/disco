import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/prisma';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateRefreshToken,
} from '@/lib/auth';
import type { LoginInput, LoginResult } from '@/types/auth';
import { z } from 'zod';
import { cookies } from 'next/headers';

// Define a custom type that includes streak fields
type UserWithStreak = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  verificationToken: string | null;
  lastLogin: Date | null;
  streakCount: number;
  lastStreak: Date | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        streakCount: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { message: 'Please verify your email before logging in' },
        { status: 403 }
      );
    }

    // Update last login and streak
    await db.$executeRaw`
      UPDATE "User"
      SET "lastLogin" = NOW(),
          "streakCount" = CASE
            WHEN "lastStreak" >= CURRENT_DATE - INTERVAL '1 day'
            THEN "streakCount" + 1
            ELSE 1
          END,
          "lastStreak" = CURRENT_DATE
      WHERE id = ${user.id}
      RETURNING *
    `;

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      generateToken(tokenPayload),
      generateRefreshToken(tokenPayload),
    ]);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        streakCount: user.streakCount,
      },
      token: accessToken,
    });

    // Set cookies using the response object
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
