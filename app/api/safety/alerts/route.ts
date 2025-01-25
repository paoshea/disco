
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { safetyService } from '@/services/api/safety.service';
import { SafetyAlertSchema } from '@/schemas/safety.schema';

async function validateRequest() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/safety/alerts
export async function GET(): Promise<NextResponse> {
  try {
    const userId = await validateRequest();
    const alerts = await safetyService.getActiveAlerts(userId);
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// POST /api/safety/alerts
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await validateRequest();
    const body = await request.json();
    const result = SafetyAlertSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid alert data', details: result.error },
        { status: 400 }
      );
    }

    const alertData = {
      ...result.data,
      priority: 'medium',
      dismissed: false,
      resolved: false,
      description: result.data.description || null,
      message: result.data.message || null,
    };
    
    const alert = await safetyService.createSafetyAlert(userId, alertData);
    return NextResponse.json(alert);
  } catch (error) {
    console.error('Failed to create alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
