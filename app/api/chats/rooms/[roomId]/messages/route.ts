// app/api/chats/rooms/[roomId]/messages/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { verifyRoomAccess, createMessage } from '@/lib/chatQueries';
import type { MessageWithSender } from '@/types/chat';

// Use Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';
// Disable static optimization
export const dynamic = 'force-dynamic';

async function authenticateRequest(request: NextRequest) {
  const headersList = await headers();
  const token = headersList.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return { error: 'Authentication required', status: 401 };
  }

  try {
    const decoded = await verifyToken(token);
    if (!decoded || !('userId' in decoded)) {
      return { error: 'Invalid token', status: 401 };
    }
    return { userId: decoded.userId };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Invalid token', status: 401 };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
): Promise<Response> {
  const auth = await authenticateRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { roomId } = await params;
    const hasAccess = await verifyRoomAccess(roomId, auth.userId);

    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Access denied to this chat room' },
        { status: 403 }
      );
    }

    const messages = await db.$queryRaw<MessageWithSender[]>`
      SELECT 
        m.*,
        jsonb_build_object(
          'id', u.id,
          'firstName', u."firstName",
          'lastName', u."lastName",
          'avatar', u.avatar
        ) as sender
      FROM "Message" m
      JOIN "User" u ON m."senderId" = u.id
      WHERE m."chatRoomId" = ${roomId}
      ORDER BY m."createdAt" DESC
    `;

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { message: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
): Promise<Response> {
  const auth = await authenticateRequest(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { roomId } = await params;
    const hasAccess = await verifyRoomAccess(roomId, auth.userId);

    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Access denied to this chat room' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { message: 'Message content is required' },
        { status: 400 }
      );
    }

    const message = await createMessage(content, roomId, auth.userId);

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { message: 'Failed to create message' },
      { status: 500 }
    );
  }
}
