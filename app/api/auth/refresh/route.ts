import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, generateToken } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(): Promise<Response> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token not found' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(refreshToken);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Verify user still exists and get their data
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

    const newToken = await generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
    });

    const response = NextResponse.json({ token: newToken });
    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
    });

    return response;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { message: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
