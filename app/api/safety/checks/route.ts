import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { safetyService } from '@/services/api/safety.service';
import { SafetyCheckSchema } from '@/schemas/safety.schema';

async function validateRequest() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  try {
    const userId = await validateRequest();
    const checks = await safetyService.getSafetyChecks(userId);

    return NextResponse.json({ checks });
  } catch (error) {
    console.error('Failed to fetch safety checks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch safety checks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await validateRequest();
    const body = (await request.json()) as Record<string, unknown>;

    const result = SafetyCheckSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid safety check data', details: result.error },
        { status: 400 }
      );
    }

    const { type, description, location, scheduledFor } = result.data;
    const check = await safetyService.createSafetyCheck(userId, {
      type,
      description,
      location,
      scheduledFor: scheduledFor || new Date().toISOString(),
    });

    return NextResponse.json({ check });
  } catch (error) {
    console.error('Failed to create safety check:', error);
    return NextResponse.json(
      { error: 'Failed to create safety check' },
      { status: 500 }
    );
  }
}
