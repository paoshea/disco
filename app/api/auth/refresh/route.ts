import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, generateToken } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST() {
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

    if (!decoded || !('userId' in decoded)) {
      return NextResponse.json(
        { message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        streakCount: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Generate new access token using role from decoded token
    const accessToken = await generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      role: decoded.role,
    });

    const response = NextResponse.json({
      user: {
        ...user,
        role: decoded.role,
      },
      token: accessToken,
    });

    // Set new access token cookie
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
    });

    return response;
  } catch (error) {
    console.error('Error in POST /api/auth/refresh:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
