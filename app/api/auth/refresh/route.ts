import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, generateToken } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token required' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(refreshToken);

    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Verify user still exists
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Generate new access token
    const accessToken = await generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
    });

    const response = NextResponse.json({
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
      },
    });

    // Set the new access token cookie
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
    });

    return response;
  } catch (error) {
    console.error('Error in refresh token:', error);
    return NextResponse.json(
      { message: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
