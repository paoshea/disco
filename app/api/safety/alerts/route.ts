import type { Location } from '@/types/location';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SafetyAlertSchema } from '@/schemas/safety.schema';
import type { SafetyAlertNew, SafetyAlertType } from '@/types/safety';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

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
    const userId = await validateRequest();
    const alerts = await prisma.safetyAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    const formattedAlerts = alerts.map(alert => {
      let locationData: LocationData;
      const location = alert.location as Prisma.JsonObject;

      if (location && typeof location === 'object') {
        locationData = {
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
          accuracy: location.accuracy ? Number(location.accuracy) : undefined,
          timestamp: new Date(location.timestamp as string),
        };
      } else {
        locationData = {
          latitude: 0,
          longitude: 0,
          timestamp: new Date(),
        };
      }

      const status = alert.dismissed
        ? 'dismissed'
        : alert.resolved
          ? 'resolved'
          : 'active';

      const formatted: SafetyAlertNew = {
        id: alert.id,
        userId: alert.userId,
        type: alert.type as SafetyAlertType,
        status,
        location: locationData,
        description: alert.description || undefined,
        message: alert.message || undefined,
        createdAt: alert.createdAt.toISOString(),
        updatedAt: alert.updatedAt.toISOString(),
        resolvedAt: alert.resolvedAt?.toISOString(),
        user: alert.user
          ? {
              id: alert.user.id,
              email: alert.user.email,
              firstName: alert.user.firstName,
              lastName: alert.user.lastName,
              name: alert.user.name || alert.user.firstName,
              emailVerified: alert.user.emailVerified !== null,
              createdAt: alert.user.createdAt,
              updatedAt: alert.user.updatedAt,
              avatar: alert.user.image || undefined,
              lastActive: alert.user.updatedAt,
              verificationStatus: 'verified',
            }
          : undefined,
      };

      return formatted;
    });

    return NextResponse.json({ alerts: formattedAlerts });
  } catch (error) {
    console.error('Error fetching safety alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch safety alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const alertData: Prisma.SafetyAlertCreateInput = {
      type: result.data.type,
      priority: 'medium',
      dismissed: false,
      resolved: false,
      description: result.data.description || null,
      message: result.data.message || null,
      updatedAt: now,
      dismissedAt: null,
      resolvedAt: null,
      location: {
        latitude: result.data.location.latitude,
        longitude: result.data.location.longitude,
        accuracy: result.data.location.accuracy || null,
        timestamp:
          result.data.location.timestamp instanceof Date
            ? result.data.location.timestamp.toISOString()
            : now.toISOString(),
      },
      user: {
        connect: { id: userId },
      },
    };

    const alert = await prisma.safetyAlert.create({ data: alertData });
    return NextResponse.json(alert);
  } catch (error) {
    console.error('Failed to create alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
