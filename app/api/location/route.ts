import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/prisma';
import { z } from 'zod';
import { locationUtils } from '@/utils';
import type { Prisma } from '@prisma/client';

// Define session user type
interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Input validation schema
const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
  timestamp: z.string().optional(),
  privacyMode: z.enum(['EXACT', 'APPROXIMATE', 'PRIVATE']).optional(),
  sharingEnabled: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user as SessionUser;
    const location = await (db as any).location.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user as SessionUser;
    const body = await request.json();

    // Validate input
    const result = locationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { latitude, longitude, accuracy, timestamp, privacyMode, sharingEnabled } = result.data;

    // Create location
    const location = await (db as any).location.create({
      data: {
        userId: user.id,
        latitude,
        longitude,
        accuracy: accuracy || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        privacyMode: privacyMode || 'EXACT',
        sharingEnabled: sharingEnabled ?? true,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user as SessionUser;
    const body = await request.json();

    // Validate input
    const result = locationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { latitude, longitude, accuracy, timestamp, privacyMode, sharingEnabled } = result.data;

    // Update latest location
    const location = await (db as any).location.update({
      where: {
        userId: user.id,
      },
      data: {
        latitude,
        longitude,
        accuracy: accuracy || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        privacyMode: privacyMode || 'EXACT',
        sharingEnabled: sharingEnabled ?? true,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
