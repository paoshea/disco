import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyRefreshToken, generateToken } from '@/lib/auth';
import { db } from '@/lib/prisma';

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
    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid refresh token', code: 'REFRESH_TOKEN_INVALID' },
        { status: 401 }
      );
    }

    // Verify user and token in database
    const user = await db.user.findUnique({
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
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid refresh token', code: 'REFRESH_TOKEN_EXPIRED' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const {
      token,
      refreshToken: newRefreshToken,
      expiresIn,
    } = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Update refresh token in database
    await db.user.update({
      where: { id: user.id },
      data: {
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Create response with new tokens
    const response = NextResponse.json({
      token,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

    // Set new cookies in response
    response.cookies.set('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    });

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error in refresh token:', error);
    return NextResponse.json(
      { message: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
