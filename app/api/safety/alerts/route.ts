import type { Location } from '@/types/location';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
//import { safetyService } from '@/services/api/safety.service'; // Removed as Prisma is used now.
import { SafetyAlertSchema } from '@/schemas/safety.schema';
import type { SafetyAlertNew, SafetyAlertType } from '@/types/safety';
import { prisma } from '@/lib/prisma';

type LocationData = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
};

async function validateRequest() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const alerts = await prisma.safetyAlert.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedAlerts: SafetyAlertNew[] = alerts.map(alert => {
      let locationData: LocationData;

      if (typeof alert.location === 'object' && alert.location) {
        const loc = alert.location as Record<string, unknown>;
        locationData = {
          latitude: Number(loc.latitude),
          longitude: Number(loc.longitude),
          ...(loc.accuracy && { accuracy: Number(loc.accuracy) }),
          timestamp: new Date(loc.timestamp as string),
        };
      } else {
        locationData = {
          latitude: 0,
          longitude: 0,
          timestamp: new Date(),
        };
      }

      return {
        id: alert.id,
        userId: alert.userId,
        type: alert.type as SafetyAlertType,
        status: alert.status as "resolved" | "dismissed" | "active",
        location: locationData,
        description: alert.description,
        createdAt: alert.createdAt,
        updatedAt: alert.updatedAt,
        resolvedAt: alert.resolvedAt,
        dismissedAt: alert.dismissedAt,
        emergencyContactIds: alert.emergencyContactIds as string[],
        responseTimeSeconds: alert.responseTimeSeconds,
      };
    });

    return NextResponse.json({ alerts: formattedAlerts });
  } catch (error) {
    console.error('Error fetching safety alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch safety alerts' }, { status: 500 });
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

    const alert = await prisma.safetyAlert.create({ data: alertData }); //Use Prisma here
    return NextResponse.json(alert);
  } catch (error) {
    console.error('Failed to create alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}