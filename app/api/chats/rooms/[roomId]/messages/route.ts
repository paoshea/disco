import { NextResponse, NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { getServerAuthSession } from '@/lib/auth';
import { db } from '@/lib/prisma';
import type { MessageWithSender } from '@/types/chat';

// Next.js 15.x specific configurations
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0; // No caching

interface AuthSuccess {
  id: string;
  error?: never;
  status?: never;
}

interface AuthError {
  error: string;
  status: number;
  id?: never;
}

type AuthResult = AuthSuccess | AuthError;

async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    const session = await getServerAuthSession(request);
    if (!session?.user?.id) {
      return { error: 'Invalid token', status: 401 };
    }
    return { id: session.user.id };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Invalid token', status: 401 };
  }
}

async function verifyRoomAccess(
  roomId: string,
  userId: string
): Promise<boolean> {
  const chatRoom = await db.chatRoom.findFirst({
    where: {
      id: roomId,
      OR: [{ creatorId: userId }, { participantId: userId }],
    },
  });
  return !!chatRoom;
}

interface RouteContext {
  params: {
    roomId: string;
  };
}

export async function GET(
  request: NextRequest,
  context: { params: { roomId: string } }
): Promise<NextResponse> {
  const auth = await authenticateRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: 401 });
  }

  try {
    const { roomId } = context.params;
    const hasAccess = await verifyRoomAccess(roomId, auth.id);

    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Unauthorized access to chat room' },
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
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

interface MessageContent {
  content: string;
}

async function createMessage(content: string, roomId: string, userId: string) {
  const message = await db.message.create({
    data: {
      content,
      chatRoomId: roomId,
      senderId: userId,
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

  return {
    ...message,
    sender: {
      ...message.sender,
      avatar: null,
    },
    timestamp: message.createdAt.toISOString(),
  };
}

export async function POST(
  request: NextRequest,
  context: { params: { roomId: string } }
): Promise<NextResponse> {
  const auth = await authenticateRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: 401 });
  }

  try {
    const { roomId } = context.params;
    const body = (await request.json()) as MessageContent;
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      );
    }

    const hasAccess = await verifyRoomAccess(roomId, auth.id);
    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Unauthorized access to chat room' },
        { status: 403 }
      );
    }

    const message = await createMessage(content, roomId, auth.id);
    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
