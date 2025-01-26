import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import { safetyService } from '@/services/api/safety.service';
import type { SafetyAlertNew, SafetyAlertType } from '@/types/safety';

export async function GET() {
  try {
    const userId = await validateRequest();
    const alertsResponse = await safetyService.getActiveAlerts(userId);

    const alerts: SafetyAlertNew[] = Array.isArray(alertsResponse) 
      ? alertsResponse.map(alert => ({
          id: alert.id,
          userId: alert.userId,
          type: alert.type as SafetyAlertType,
          status: alert.dismissed ? 'dismissed' : alert.resolved ? 'resolved' : 'active',
          message: alert.message || undefined,
          description: alert.description || undefined,
          location: alert.location ? {
            latitude: Number(alert.location.latitude),
            longitude: Number(alert.location.longitude),
            accuracy: alert.location.accuracy ? Number(alert.location.accuracy) : undefined,
            timestamp: new Date()
          } : undefined,
          evidence: alert.evidence || [],
          createdAt: new Date(alert.createdAt).toISOString(),
          updatedAt: new Date(alert.updatedAt).toISOString(),
          resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt).toISOString() : undefined
        }))
      : [];

    return NextResponse.json({ alerts });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
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

    const now = new Date();
    const alertData = {
      ...result.data,
      priority: 'medium',
      dismissed: false,
      resolved: false,
      description: result.data.description || null,
      message: result.data.message || null,
      updatedAt: now,
      dismissedAt: null,
      resolvedAt: null,
      location: result.data.location
        ? {
            latitude: result.data.location.latitude,
            longitude: result.data.location.longitude,
            accuracy: result.data.location.accuracy || null,
            timestamp:
              result.data.location.timestamp instanceof Date
                ? result.data.location.timestamp.toISOString()
                : now.toISOString(),
          }
        : {
            latitude: 0,
            longitude: 0,
            accuracy: null,
            timestamp: now.toISOString(),
          },
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