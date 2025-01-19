import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/prisma';
import { z } from 'zod';
import type { Event, EventParticipant } from '@/types/event';
import type { ExtendedPrismaClient } from '@/lib/prisma';

// Define session user type
interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Input validation schema
const actionSchema = z.object({
  action: z.enum(['join', 'leave']),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// Initialize typed Prisma client
const eventDb = (db as ExtendedPrismaClient).$extends.model.event;

type PrismaEvent = {
  id: string;
  creatorId: string;
  type: string;
  maxParticipants: number | null;
  participants: Array<{
    userId: string;
    user: {
      id: string;
      name: string | null;
    };
  }>;
  creator: {
    id: string;
    name: string | null;
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const user = session.user as SessionUser;
    const eventId = params.id;

    const event = await eventDb.findUnique({
      where: { id: eventId },
      include: {
        creator: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    }) as PrismaEvent | null;

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 },
      );
    }

    // Check if user has permission to view the event
    const isCreator = event.creatorId === user.id;
    const isParticipant = event.participants.some(
      (participant) => participant.userId === user.id,
    );

    if (!isCreator && !isParticipant && event.type === 'private') {
      return NextResponse.json(
        { error: 'Not authorized to view this event' },
        { status: 403 },
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const user = session.user as SessionUser;
    const eventId = params.id;
    const body = await request.json();
    const result = actionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const { action } = result.data;

    const event = await eventDb.findUnique({
      where: { id: eventId },
      include: {
        participants: true,
      },
    }) as PrismaEvent | null;

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 },
      );
    }

    const isParticipant = event.participants.some(
      (participant) => participant.userId === user.id,
    );

    if (action === 'join') {
      if (isParticipant) {
        return NextResponse.json(
          { error: 'Already joined this event' },
          { status: 400 },
        );
      }

      // Check if event is full
      if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
        return NextResponse.json(
          { error: 'Event is full' },
          { status: 400 },
        );
      }

      const updatedEvent = await eventDb.update({
        where: { id: eventId },
        data: {
          participants: {
            create: {
              userId: user.id,
            },
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
      }) as PrismaEvent;

      return NextResponse.json(updatedEvent);
    } else if (action === 'leave') {
      if (!isParticipant) {
        return NextResponse.json(
          { error: 'Not a participant of this event' },
          { status: 400 },
        );
      }

      const updatedEvent = await eventDb.update({
        where: { id: eventId },
        data: {
          participants: {
            delete: {
              eventId_userId: {
                eventId,
                userId: user.id,
              },
            },
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
      }) as PrismaEvent;

      return NextResponse.json(updatedEvent);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
