import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRefreshToken, generateTokens } from '@/lib/auth';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token not found', code: 'REFRESH_TOKEN_MISSING' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const decoded = await verifyRefreshToken(
      refreshToken,
      process.env.JWT_SECRET || 'default-secret'
    );
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid refresh token', code: 'REFRESH_TOKEN_INVALID' },
        { status: 401 }
      );
    }

    // Verify user and token in database
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        refreshToken,
        refreshTokenExpiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        streakCount: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid refresh token', code: 'REFRESH_TOKEN_EXPIRED' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const tokenResult = await generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      streakCount: user.streakCount,
    });

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: tokenResult.refreshToken,
        refreshTokenExpiresAt: new Date(
          Date.now() + tokenResult.refreshTokenExpiresIn * 1000
        ),
      },
    });

    // Create response with new tokens
    const response = NextResponse.json({
      user,
      ...tokenResult,
    });

    // Set new refresh token in cookie
    response.cookies.set('refreshToken', tokenResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokenResult.refreshTokenExpiresIn,
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { message: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
