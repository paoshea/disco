import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/prisma';

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

interface MessageInfo {
  id: string;
  content: string;
  senderId: string;
  chatRoomId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatRoomInfo {
  id: string;
  name: string | null;
  creatorId: string;
  participantId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatRoomWithRelations extends ChatRoomInfo {
  creator: UserInfo;
  participant: UserInfo;
  messages: MessageInfo[];
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

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
      WHERE cr."creatorId" = ${decoded.userId}
      OR cr."participantId" = ${decoded.userId}
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
