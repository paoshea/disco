import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/prisma';
import { generateJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Find user with valid refresh token
    const user = await db.user.findFirst({
      where: {
        AND: [
          { refreshToken },
          {
            refreshTokenExpiresAt: {
              gt: new Date(),
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Generate new access token
    const accessToken = generateJWT({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return NextResponse.json({ token: accessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { message: 'An error occurred during token refresh' },
      { status: 500 }
    );
  }
}
