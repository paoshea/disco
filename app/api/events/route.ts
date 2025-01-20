import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

// Define the Event type with proper Prisma typing
type Event = Prisma.EventGetPayload<{
  include: {
    participants: {
      include: {
        user: true;
      };
    };
    creator: true;
  };
}>;

// Define participant type for better type safety
type EventParticipant = Prisma.EventParticipantGetPayload<{
  include: {
    user: true;
  };
}>;

// Define the complete event type with participants
interface EventWithParticipants extends Event {
  participants: EventParticipant[];
  currentParticipants: number;
}

interface CreateEventBody {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  latitude: number;
  longitude: number;
  type: string;
  maxParticipants?: number;
  tags?: string[];
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const location = await db.location.findFirst({
      where: {
        userId: session.user.id,
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

    const radiusInMeters = parseFloat(searchParams.get('radius') ?? '500');
    const userLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
    };

    // Calculate bounding box for spatial query
    const latitudeDelta = radiusInMeters / 111000; // 111km per degree
    const minLat = userLocation.latitude - latitudeDelta;
    const maxLat = userLocation.latitude + latitudeDelta;

    const longitudeDelta =
      radiusInMeters /
      (111000 * Math.cos((userLocation.latitude * Math.PI) / 180));
    const minLon = userLocation.longitude - longitudeDelta;
    const maxLon = userLocation.longitude + longitudeDelta;

    let events: Event[];
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = searchParams.get('radius');

    if (latitude && longitude && radius) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const rad = parseFloat(radius);

      if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
        return NextResponse.json(
          { error: 'Invalid latitude, longitude, or radius parameters' },
          { status: 400 }
        );
      }

      events = await db.event.findMany({
        where: {
          AND: [
            {
              latitude: {
                gte: lat - rad,
                lte: lat + rad,
              },
            },
            {
              longitude: {
                gte: lng - rad,
                lte: lng + rad,
              },
            },
          ],
        },
        include: {
          creator: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
      });
    } else {
      events = await db.event.findMany({
        where: {
          latitude: {
            gte: minLat,
            lte: maxLat,
          },
          longitude: {
            gte: minLon,
            lte: maxLon,
          },
        },
        include: {
          creator: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
      });
    }

    // Add currentParticipants count with proper typing
    const eventsWithCount: EventWithParticipants[] = events.map(event => ({
      ...event,
      currentParticipants: event.participants.length,
    }));

    return NextResponse.json(eventsWithCount);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      title: string;
      description?: string;
      startTime: string;
      endTime?: string;
      latitude: number;
      longitude: number;
      type: 'social' | 'virtual' | 'hybrid';
      maxParticipants?: number;
      tags?: string[];
    };

    const event = await db.event.create({
      data: {
        title: body.title,
        description: body.description,
        startTime: new Date(body.startTime),
        endTime: body.endTime ? new Date(body.endTime) : undefined,
        latitude: body.latitude,
        longitude: body.longitude,
        type: body.type,
        maxParticipants: body.maxParticipants,
        tags: body.tags,
        creatorId: session.user.id,
      },
      include: {
        creator: true,
        participants: {
          include: {
            user: true,
          },
        },
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
