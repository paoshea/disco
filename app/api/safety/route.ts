import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { safetyService } from '@/services/api/safety.service';

async function validateRequest(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

// GET /api/safety
export async function GET(request: Request) {
  try {
    const userId = await validateRequest(request);

    const [alerts, checks] = await Promise.all([
      prisma.safetyAlert.findMany({
        where: {
          userId,
          dismissed: false,
          resolved: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.safetyCheck.findMany({
        where: {
          userId,
          completedAt: null,
          status: 'pending',
        },
        orderBy: {
          scheduledFor: 'asc',
        },
      }),
    ]);

    return NextResponse.json({ alerts, checks });
  } catch (error) {
    console.error('Failed to fetch safety data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch safety data' },
      { status: 500 }
    );
  }
}

// POST /api/safety/emergency
export async function POST(request: Request) {
  try {
    const userId = await validateRequest(request);
    const data = await request.json();
    await safetyService.updateSafetySettings(userId, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
