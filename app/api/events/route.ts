import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/prisma';
import type { CreateEventInput, Event, EventType } from '@/types/event';
import { z } from 'zod';

// Define session user type
interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Input validation schema for query parameters
const querySchema = z.object({
  radius: z.string().optional(),
  types: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
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
    const { searchParams } = new URL(request.url);
    
    // Validate and parse query parameters
    const result = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { radius, types, startTime, endTime } = result.data;

    // Get user's location
    const userLocation = await (db as any).location.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (!userLocation) {
      return NextResponse.json(
        { error: 'User location not found' },
        { status: 404 }
      );
    }

    // Parse event types
    const eventTypes = types ? (types.split(',') as EventType[]) : undefined;

    // Build where clause
    const where: any = {
      startTime: startTime ? { gte: new Date(startTime) } : undefined,
      endTime: endTime ? { lte: new Date(endTime) } : undefined,
      type: eventTypes?.length ? { in: eventTypes } : undefined,
    };

    // If radius is provided, add location filter
    if (radius && userLocation) {
      const radiusInMeters = parseInt(radius, 10) * 1000; // Convert km to meters
      where.latitude = {
        gte: userLocation.latitude - radiusInMeters / 111000, // Rough conversion
        lte: userLocation.latitude + radiusInMeters / 111000,
      };
      where.longitude = {
        gte: userLocation.longitude - radiusInMeters / (111000 * Math.cos(userLocation.latitude * Math.PI / 180)),
        lte: userLocation.longitude + radiusInMeters / (111000 * Math.cos(userLocation.latitude * Math.PI / 180)),
      };
    }

    // Get events
    const events = await (db as any).event.findMany({
      where,
      include: {
        creator: true,
        participants: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
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
    if (!body.title || !body.latitude || !body.longitude || !body.startTime || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create event
    const event = await (db as any).event.create({
      data: {
        ...body,
        creator: {
          connect: { id: user.id }
        },
        participants: {
          create: {
            userId: user.id
          }
        }
      },
      include: {
        creator: true,
        participants: {
          include: {
            user: true
          }
        }
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
