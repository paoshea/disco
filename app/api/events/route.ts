import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

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
        userId: (session.user as any).id,
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

    let events;
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

    // Add currentParticipants count
    const eventsWithCount = events.map(
      (event: Event & { participants: Array<{ userId: string }> }) => ({
        ...event,
        currentParticipants: event.participants.length,
      })
    );

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

    const body = await request.json();
    const eventData = body as CreateEventBody;

    const event = await db.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        startTime: new Date(eventData.startTime),
        endTime: eventData.endTime ? new Date(eventData.endTime) : null,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        type: eventData.type,
        maxParticipants: eventData.maxParticipants,
        tags: eventData.tags || [],
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
