import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decodedToken = await verifyToken(token);
    const decoded = decodedToken as { userId: string; role: string } | null;

    if (!decoded || !decoded.userId || !decoded.role) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
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

    // Add role from token since it's not yet in the database
    // We know decoded.role exists because we checked above
    return NextResponse.json({
      ...user,
      role: decoded.role,
    });
  } catch (error) {
    console.error('Error in GET /api/auth/me:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
