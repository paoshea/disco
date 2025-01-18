import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/prisma';
import { generateToken, verifyToken } from '@/lib/auth';
import { z } from 'zod';

const refreshSchema = z.object({
  refreshToken: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as z.infer<typeof refreshSchema>;
    const result = refreshSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid refresh token format' },
        { status: 400 }
      );
    }

    const { refreshToken } = result.data;

    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Generate new access token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      role: 'user',
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Error refreshing token' },
      { status: 500 }
    );
  }
}
