import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/prisma';
import type { Event, EventSearchParams, CreateEventInput } from '@/types/event';
import { createEventSchema } from '@/types/event';
import type { User } from '@/types/user';

// Initialize Prisma client models
const eventDb = db.$extends.model.event;
const locationDb = db.$extends.model.location;

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const location = await locationDb.findFirst({
      where: {
        userId: (session.user as User).id,
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

    const events = await eventDb.findMany({
      where: {
        location: {
          latitude: {
            gte: minLat,
            lte: maxLat,
          },
          longitude: {
            gte: minLon,
            lte: maxLon,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        participants: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

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
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedBody = createEventSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const userId = (session.user as User).id;
    const eventData = {
      ...validatedBody.data,
      creatorId: userId,
      currentParticipants: 0,
      participants: {
        create: {
          userId,
          status: 'confirmed',
        },
      },
    };

    const event = await eventDb.create({
      data: eventData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        participants: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
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
