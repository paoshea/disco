import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { comparePasswords, generateTokens } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as z.infer<typeof LoginSchema>;
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        streakCount: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await comparePasswords(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const userWithoutPassword = user;
    const tokens = await generateTokens(userWithoutPassword);

    // Update last login time and streak
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        refreshToken: tokens.refreshToken,
        refreshTokenExpiresAt: new Date(
          new Date().getTime() + tokens.refreshTokenExpiresIn * 1000
        ),
      },
    });

    const response = NextResponse.json({
      user: userWithoutPassword,
      token: tokens.token,
    });

    // Set refresh token in HTTP-only cookie
    response.cookies.set({
      name: 'refreshToken',
      value: tokens.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokens.refreshTokenExpiresIn,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
