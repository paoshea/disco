import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import type { JWTPayload } from '@/lib/auth';
import { isRateLimited } from '@/lib/rateLimit';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginRequest = z.infer<typeof loginSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid email or password format' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Check rate limiting with validated email
    const limiter = await isRateLimited(email, 'login');
    if (limiter) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Find user
    const users = await db.$queryRaw<
      Array<{
        id: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        emailVerified: boolean;
        lastStreak: Date | null;
        streakCount: number;
      }>
    >`
      SELECT 
        id, 
        email, 
        password,
        "firstName",
        "lastName",
        "emailVerified",
        "lastStreak",
        "streakCount"
      FROM "User"
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    const user = users[0];
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: 'Please verify your email before logging in',
          needsVerification: true,
        },
        { status: 403 }
      );
    }

    // Generate JWT token with only the required fields
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: 'user',
      firstName: user.firstName,
    });

    const now = new Date();
    const refreshTokenExpiresAt = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000
    ); // 7 days

    // Update user's refresh token and last login
    await db.$executeRaw`
      UPDATE "User"
      SET 
        "lastLogin" = ${now},
        "lastStreak" = ${now},
        "streakCount" = ${user.streakCount + 1}
      WHERE id = ${user.id}
    `;

    // Create response with cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        streakCount: user.streakCount + 1,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
