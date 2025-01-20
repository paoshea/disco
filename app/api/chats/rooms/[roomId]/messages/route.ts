import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { db } from '@/lib/prisma';
import type { MessageWithSender } from '@/types/chat';

// Use Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';

interface AuthSuccess {
  userId: string;
}

interface AuthError {
  error: string;
  status: number;
}

type AuthResult = AuthSuccess | AuthError;

async function authenticateRequest(): Promise<AuthResult> {
  const session = await getServerAuthSession();

  if (!session?.user) {
    return { error: 'Unauthorized', status: 401 };
  }

  return { userId: session.user.id };
}

export async function GET(
  _request: NextRequest,
  context: { params: { roomId: string } }
): Promise<Response> {
  const auth = await authenticateRequest();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { roomId } = context.params;

    // Check if user is part of the room
    const chatRoom = await db.chatRoom.findFirst({
      where: {
        id: roomId,
        OR: [{ creatorId: auth.userId }, { participantId: auth.userId }],
      },
    });

    if (!chatRoom) {
      return NextResponse.json(
        { error: 'Not a member of this chat room' },
        { status: 403 }
      );
    }

    const messages = await db.message.findMany({
      where: {
        chatRoomId: roomId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Transform messages to include required fields
    const transformedMessages: MessageWithSender[] = messages.map(msg => ({
      ...msg,
      sender: {
        ...msg.sender,
        avatar: null, // Add missing field with default value
      },
      timestamp: msg.createdAt.toISOString(),
    }));

    return NextResponse.json({ messages: transformedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { roomId: string } }
): Promise<Response> {
  const auth = await authenticateRequest();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { roomId } = context.params;
    const body = (await request.json()) as { content: string };
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Check if user is part of the room
    const chatRoom = await db.chatRoom.findFirst({
      where: {
        id: roomId,
        OR: [{ creatorId: auth.userId }, { participantId: auth.userId }],
      },
    });

    if (!chatRoom) {
      return NextResponse.json(
        { error: 'Not a member of this chat room' },
        { status: 403 }
      );
    }

    const message = await db.message.create({
      data: {
        content,
        chatRoomId: roomId,
        senderId: auth.userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Transform message to include required fields
    const transformedMessage: MessageWithSender = {
      ...message,
      sender: {
        ...message.sender,
        avatar: null, // Add missing field with default value
      },
      timestamp: message.createdAt.toISOString(),
    };

    return NextResponse.json(transformedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
