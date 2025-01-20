import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { eventService } from '@/services/event/event.service';
import type { Event } from '@/types/event';
import type { EventUpdateInput } from '@/services/event/event.service';

interface RouteParams {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { data, success, error } = await eventService.getEventById(id);

    if (!success || !data) {
      return NextResponse.json(
        { error: error || 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const event = await eventService.getEventById(id);

    if (!event.success || !event.data) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.data.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this event' },
        { status: 403 }
      );
    }

    const { success, error } = await eventService.leaveEvent(
      id,
      session.user.id
    );

    if (!success) {
      return NextResponse.json(
        { error: error || 'Failed to delete event' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const event = await eventService.getEventById(id);

    if (!event.success || !event.data) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.data.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this event' },
        { status: 403 }
      );
    }

    const body = (await request.json()) as EventUpdateInput;
    const { success, error, data } = await eventService.updateEvent(id, body);

    if (!success) {
      return NextResponse.json(
        { error: error || 'Failed to update event' },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
