import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/prisma';

// Use Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';
// Disable static optimization
export const dynamic = 'force-dynamic';

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

interface MessageWithSender {
  id: string;
  content: string;
  chatRoomId: string;
  senderId: string;
  createdAt: Date;
  updatedAt: Date;
  sender: UserInfo;
}

export async function GET(
  request: Request,
  context: { params: { roomId: string } }
) {
  const { params } = context;
  const { roomId } = params;

  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded || !('userId' in decoded)) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Verify user has access to this chat room
    const chatRoom = await db.$queryRaw<{ id: string }[]>`
      SELECT cr.id
      FROM "ChatRoom" cr
      WHERE cr.id = ${roomId}
      AND (cr."creatorId" = ${decoded.userId} OR cr."participantId" = ${decoded.userId})
      LIMIT 1
    `;

    if (!chatRoom.length) {
      return NextResponse.json(
        { message: 'Access denied to this chat room' },
        { status: 403 }
      );
    }

    // Get messages with sender information
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
    console.error('Error in GET /api/chats/rooms/[roomId]/messages:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: { roomId: string } }
) {
  const { params } = context;
  const { roomId } = params;

  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded || !('userId' in decoded)) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Verify user has access to this chat room
    const chatRoom = await db.$queryRaw<{ id: string }[]>`
      SELECT cr.id
      FROM "ChatRoom" cr
      WHERE cr.id = ${roomId}
      AND (cr."creatorId" = ${decoded.userId} OR cr."participantId" = ${decoded.userId})
      LIMIT 1
    `;

    if (!chatRoom.length) {
      return NextResponse.json(
        { message: 'Access denied to this chat room' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const content = body.content as string;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { message: 'Message content is required' },
        { status: 400 }
      );
    }

    // Create new message
    const [newMessage] = await db.$queryRaw<MessageWithSender[]>`
      WITH new_message AS (
        INSERT INTO "Message" (
          id,
          content,
          "chatRoomId",
          "senderId",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          gen_random_uuid(),
          ${content}::text,
          ${roomId}::uuid,
          ${decoded.userId}::uuid,
          NOW(),
          NOW()
        )
        RETURNING *
      )
      SELECT 
        m.*,
        jsonb_build_object(
          'id', u.id,
          'firstName', u."firstName",
          'lastName', u."lastName",
          'avatar', u.avatar
        ) as sender
      FROM new_message m
      JOIN "User" u ON m."senderId" = u.id
    `;

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error in POST /api/chats/rooms/[roomId]/messages:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
