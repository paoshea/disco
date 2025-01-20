// app/api/chats/rooms/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { db } from '@/lib/prisma';
import type { ChatRoomWithRelations } from '@/types/chat';

async function handleGet(request: NextRequest) {
  try {
    const session = await getServerAuthSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const chatRooms = await db.$queryRaw<ChatRoomWithRelations[]>`
      SELECT 
        cr.id,
        cr.name,
        cr."creatorId",
        cr."participantId",
        cr."createdAt",
        cr."updatedAt",
        json_build_object(
          'id', creator.id,
          'firstName', creator.first_name,
          'lastName', creator.last_name,
          'avatar', creator.avatar
        ) as creator,
        json_build_object(
          'id', participant.id,
          'firstName', participant.first_name,
          'lastName', participant.last_name,
          'avatar', participant.avatar
        ) as participant,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', m.id,
                'content', m.content,
                'senderId', m."senderId",
                'chatRoomId', m."chatRoomId",
                'createdAt', m."createdAt",
                'updatedAt', m."updatedAt"
              )
            )
            FROM "Message" m
            WHERE m."chatRoomId" = cr.id
            ORDER BY m."createdAt" DESC
            LIMIT 1
          ),
          '[]'::json
        ) as messages
      FROM "ChatRoom" cr
      JOIN "User" creator ON cr."creatorId" = creator.id
      JOIN "User" participant ON cr."participantId" = participant.id
      WHERE cr."creatorId" = ${userId}
      OR cr."participantId" = ${userId}
    `;

    return NextResponse.json({
      data: {
        chats: chatRooms.map((room: ChatRoomWithRelations) => ({
          id: room.id,
          name: room.name,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
          lastMessage: room.messages[0] || null,
          creator: room.creator,
          participant: room.participant,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching chat rooms' },
      { status: 500 }
    );
  }
}

export const GET = (request: NextRequest) => handleGet(request);
