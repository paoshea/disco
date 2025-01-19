import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/prisma';
import type { EventWithParticipants } from '@/types/event';
import { actionSchema } from '@/types/event';
import type { User } from '@/types/user';

// Initialize Prisma client
const eventDb = db.$extends.model.event;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;

    const event = (await eventDb.findUnique({
      where: { id },
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
    })) as EventWithParticipants | null;

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedBody = actionSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { action } = validatedBody.data;
    const userId = (session.user as User).id;

    const event = (await eventDb.findUnique({
      where: { id },
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
      },
    })) as EventWithParticipants | null;

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (action === 'join') {
      // Check if user is already a participant
      const isParticipant = event.participants.some(p => p.userId === userId);
      if (isParticipant) {
        return NextResponse.json(
          { error: 'Already joined event' },
          { status: 400 }
        );
      }

      // Check if event is full
      if (
        event.maxParticipants &&
        event.participants.length >= event.maxParticipants
      ) {
        return NextResponse.json({ error: 'Event is full' }, { status: 400 });
      }

      // Join event
      await eventDb.update({
        where: { id },
        data: {
          participants: {
            create: {
              userId,
            },
          },
        },
      });
    } else {
      // Leave event
      const isParticipant = event.participants.some(p => p.userId === userId);
      if (!isParticipant) {
        return NextResponse.json(
          { error: 'Not a participant' },
          { status: 400 }
        );
      }

      await eventDb.update({
        where: { id },
        data: {
          participants: {
            delete: {
              eventId_userId: {
                eventId: id,
                userId,
              },
            },
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
