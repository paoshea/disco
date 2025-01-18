import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/prisma';
import {
  generateToken,
  verifyPassword,
  generateRefreshToken,
} from '@/lib/auth';
import type { JWTPayload } from '@/lib/auth';
import { z } from 'zod';

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
    const body = (await request.json()) as unknown;
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Fetch user with raw SQL
    const [user] = await db.$queryRaw<[UserWithStreak]>`
      SELECT *
      FROM "User"
      WHERE email = ${email}
    `;

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in' },
        { status: 403 }
      );
    }

    // Calculate streak
    const now = new Date();
    const lastLoginDate = user.lastLogin ? new Date(user.lastLogin) : null;

    let newStreakCount = user.streakCount ?? 0;

    if (!lastLoginDate) {
      // First login
      newStreakCount = 1;
    } else {
      const daysSinceLastLogin = Math.floor(
        (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastLogin <= 1) {
        // Login within 24 hours, increment streak if it's a new day
        const isNewDay = lastLoginDate.getDate() !== now.getDate();
        if (isNewDay) {
          newStreakCount += 1;
        }
      } else if (daysSinceLastLogin > 2) {
        // Missed a day, reset streak
        newStreakCount = 1;
      }
    }

    // Update user with new streak information using raw SQL
    const [updatedUser] = await db.$queryRaw<[UserWithStreak]>`
      UPDATE "User"
      SET "lastLogin" = ${now},
          "streakCount" = ${newStreakCount},
          "lastStreak" = ${now}
      WHERE id = ${user.id}
      RETURNING *
    `;

    // Generate tokens
    const tokenPayload: JWTPayload = {
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
        streakCount: updatedUser.streakCount,
      },
      token: accessToken,
    });

    // Set cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
