import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { comparePasswords, generateTokens } from '@/lib/auth';
import { db } from '@/lib/prisma';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = (await request.json()) as LoginRequest;
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        streakCount: true,
        emailVerified: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password hash
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate tokens
    const { token, refreshToken, accessTokenExpiresIn } = await generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      streakCount: user.streakCount,
    });

    // Update last login and streak
    const now = new Date();
    await db.user.update({
      where: { id: user.id },
      data: {
        lastLogin: now,
        refreshToken,
        refreshTokenExpiresAt: new Date(
          now.getTime() + accessTokenExpiresIn * 1000
        ),
      },
    });

    // Create response with cookies
    const response = NextResponse.json({
      token,
      refreshToken,
      expiresIn: accessTokenExpiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        streakCount: user.streakCount,
        emailVerified: user.emailVerified,
      },
    });

    // Set cookies in response
    response.cookies.set('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: accessTokenExpiresIn,
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
