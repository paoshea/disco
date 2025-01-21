import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type UserResponse = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  firstName: string;
  lastName: string;
  emailVerified: Date | null;
  image: string | null;
  streakCount: number;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type ErrorResponse = {
  error: string;
};

export async function GET(
  request: NextRequest
): Promise<NextResponse<{ user: UserResponse } | ErrorResponse>> {
  try {
    const session = await getServerAuthSession(request);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        image: true,
        streakCount: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      image: user.image,
      streakCount: user.streakCount,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
