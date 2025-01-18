import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/prisma';

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
  try {
    const headersList = await headers();
    const token = headersList.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Verify user has access to this chat room
    const chatRoom = await db.$queryRaw<{ id: string }[]>`
      SELECT cr.id
      FROM "ChatRoom" cr
      WHERE cr.id = ${context.params.roomId}
      AND (cr."creatorId" = ${decoded.userId} OR cr."participantId" = ${decoded.userId})
      LIMIT 1
    `;

    if (!chatRoom.length) {
      return NextResponse.json(
        { message: 'Chat room not found or access denied' },
        { status: 404 }
      );
    }

    const messages = await db.$queryRaw<MessageWithSender[]>`
      SELECT 
        m.id,
        m.content,
        m."chatRoomId",
        m."senderId",
        m."createdAt",
        m."updatedAt",
        json_build_object(
          'id', u.id,
          'firstName', u.first_name,
          'lastName', u.last_name,
          'avatar', u.avatar
        ) as sender
      FROM "Message" m
      JOIN "User" u ON m."senderId" = u.id
      WHERE m."chatRoomId" = ${context.params.roomId}
      ORDER BY m."createdAt" DESC
    `;

    return NextResponse.json({
      data: {
        messages: messages.map((msg: MessageWithSender) => ({
          id: msg.id,
          content: msg.content,
          createdAt: msg.createdAt,
          sender: msg.sender,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: { roomId: string } }
) {
  try {
    const headersList = await headers();
    const token = headersList.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Verify user has access to this chat room
    const chatRoom = await db.$queryRaw<{ id: string }[]>`
      SELECT cr.id
      FROM "ChatRoom" cr
      WHERE cr.id = ${context.params.roomId}
      AND (cr."creatorId" = ${decoded.userId} OR cr."participantId" = ${decoded.userId})
      LIMIT 1
    `;

    if (!chatRoom.length) {
      return NextResponse.json(
        { message: 'Chat room not found or access denied' },
        { status: 404 }
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

    const [message] = await db.$queryRaw<MessageWithSender[]>`
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
          ${context.params.roomId}::uuid,
          ${decoded.userId}::uuid,
          NOW(),
          NOW()
        )
        RETURNING *
      )
      SELECT 
        m.id,
        m.content,
        m."chatRoomId",
        m."senderId",
        m."createdAt",
        m."updatedAt",
        json_build_object(
          'id', u.id,
          'firstName', u.first_name,
          'lastName', u.last_name,
          'avatar', u.avatar
        ) as sender
      FROM new_message m
      JOIN "User" u ON m."senderId" = u.id
    `;

    return NextResponse.json({
      data: {
        message: {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          sender: message.sender,
        },
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { message: 'An error occurred while sending message' },
      { status: 500 }
    );
  }
}
