// app/api/chats/rooms/[roomId]/messages/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/prisma';
import {
  withAuth,
  type AuthenticatedRequest,
} from '@/middleware/authMiddleware';
import { verifyRoomAccess, createMessage } from '@/lib/chatQueries';
import type { MessageWithSender } from '@/types/chat';

// Use Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';
// Disable static optimization
export const dynamic = 'force-dynamic';

async function handleGet(
  request: AuthenticatedRequest,
  { params }: { params: { roomId: string } }
) {
  const { roomId } = params;

  try {
    const hasAccess = await verifyRoomAccess(roomId, request.user.userId);

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

async function handlePost(
  request: AuthenticatedRequest,
  { params }: { params: { roomId: string } }
) {
  const { roomId } = params;

  try {
    const hasAccess = await verifyRoomAccess(roomId, request.user.userId);

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

    const message = await createMessage(
      content,
      roomId,
      request.user.userId
    );

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { message: 'Failed to create message' },
      { status: 500 }
    );
  }
}

export const GET = (request: NextRequest, context: { params: { roomId: string } }) =>
  withAuth(request, (req: AuthenticatedRequest) => handleGet(req, context));

export const POST = (request: NextRequest, context: { params: { roomId: string } }) =>
  withAuth(request, (req: AuthenticatedRequest) => handlePost(req, context));
