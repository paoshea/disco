import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyRefreshToken, generateTokens } from '@/lib/auth';
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
    const tokenResult = await generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Update refresh token in database
    await db.user.update({
      where: { id: user.id },
      data: {
        refreshToken: tokenResult.refreshToken,
        refreshTokenExpiresAt: new Date(
          Date.now() + tokenResult.refreshTokenExpiresIn * 1000
        ),
      },
    });

    // Create response with new tokens
    return NextResponse.json({
      token: tokenResult.token,
      refreshToken: tokenResult.refreshToken,
      accessTokenExpiresIn: tokenResult.accessTokenExpiresIn,
      refreshExpiresIn: tokenResult.refreshTokenExpiresIn,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Error in refresh token:', error);
    return NextResponse.json(
      { message: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
