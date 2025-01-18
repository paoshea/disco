// app/api/chats/rooms/[roomId]/messages/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/authMiddleware';
import { verifyRoomAccess, createMessage } from '@/lib/chatQueries';
import type { MessageWithSender } from '@/types/chat';

// Use Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';
// Disable static optimization
export const dynamic = 'force-dynamic';

async function handleGet(
  request: AuthenticatedRequest,
  context: { params: Record<string, string> }
) {
  const { params } = context;
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
    console.error('Error in GET /api/chats/rooms/[roomId]/messages:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handlePost(
  request: AuthenticatedRequest,
  context: { params: Record<string, string> }
) {
  const { params } = context;
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
    const content = body.content as string;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { message: 'Message content is required' },
        { status: 400 }
      );
    }

    const newMessage = await createMessage(content, roomId, request.user.userId);
    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error in POST /api/chats/rooms/[roomId]/messages:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = (request: NextRequest, context: { params: Record<string, string> }) =>
  withAuth(request, (req: NextRequest) => handleGet(req as AuthenticatedRequest, context));

export const POST = (request: NextRequest, context: { params: Record<string, string> }) =>
  withAuth(request, (req: NextRequest) => handlePost(req as AuthenticatedRequest, context));
