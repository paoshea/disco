import { db } from './prisma';
import { MessageWithSender } from '@/types/chat';

interface ChatRoomAccess {
  id: string;
}

export async function verifyRoomAccess(
  roomId: string,
  userId: string
): Promise<boolean> {
  const chatRoom = await db.$queryRaw<ChatRoomAccess[]>`
    SELECT cr.id
    FROM "ChatRoom" cr
    WHERE cr.id = ${roomId}
    AND (cr."creatorId" = ${userId} OR cr."participantId" = ${userId})
    LIMIT 1
  `;

  return chatRoom.length > 0;
}

export async function createMessage(
  content: string,
  roomId: string,
  userId: string
): Promise<MessageWithSender> {
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
        ${userId}::uuid,
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

  return newMessage;
}
