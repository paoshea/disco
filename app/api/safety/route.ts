import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { safetyService } from '@/services/api/safety.service';
import { SafetySettingsSchema } from '@/schemas/safety.schema';

async function validateRequest() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/safety
export async function GET(): Promise<NextResponse> {
  try {
    const userId = await validateRequest();

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

// POST /api/safety/settings
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await validateRequest();
    const body = await request.json();

    // Validate request body
    const validatedData = SafetySettingsSchema.parse(body);

    // Store the validated data for future implementation
    console.log('Received safety settings:', validatedData);

    await safetyService.updateSafetySettings(userId);
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
