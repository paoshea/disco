import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/prisma';
import { verifyPassword, generateJWT, generateToken } from '@/lib/auth';
import type { JWTPayload } from '@/lib/auth';
import { isRateLimited } from '@/lib/rateLimit';

interface LoginRequest {
  email: string;
  password: string;
}

interface UserData {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  lastStreak: Date | null;
  streakCount: number;
}

const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function POST(request: NextRequest) {
  try {
    const { email, password } = (await request.json()) as LoginRequest;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimited = await isRateLimited(email, 'login');
    if (rateLimited) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Find user
    const users = await db.$queryRaw<UserData[]>`
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
      WHERE email = ${email}
      LIMIT 1
    `;

    const user = users[0];
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const validPassword = await verifyPassword(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { needsVerification: true },
        { status: 401 }
      );
    }

    // Generate tokens
    const jwtPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    const token = generateJWT(jwtPayload);

    const refreshToken = generateToken();
    const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);

    // Calculate streak
    const now = new Date();
    const lastStreak = user.lastStreak ? new Date(user.lastStreak) : null;
    const streakCount = lastStreak && 
      now.getTime() - lastStreak.getTime() < 48 * 60 * 60 * 1000 ? // Within 48 hours
      user.streakCount + 1 : 1;

    // Update user's refresh token and last login
    await db.$executeRaw`
      UPDATE "User"
      SET 
        "refreshToken" = ${refreshToken},
        "refreshTokenExpiresAt" = ${refreshTokenExpiresAt},
        "lastLogin" = ${now},
        "lastStreak" = ${now},
        "streakCount" = ${streakCount}
      WHERE id = ${user.id}
    `;

    // Create response with cookie
    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        streakCount,
      },
    });

    // Set cookie on response
    response.cookies.set({
      name: 'refreshToken',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: refreshTokenExpiresAt,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error during login' },
      { status: 500 }
    );
  }
}
