import { prisma } from '@/lib/prisma';
import { chatArchiveService } from '../chat/archive.service';
import { notificationService } from '../notifications/notification.service';

export class BlockService {
  async blockUser(userId: string, blockedUserId: string) {
    // Archive any existing chats first
    const existingChat = await prisma.chatRoom.findFirst({
      where: {
        OR: [{ participantId: { in: [userId, blockedUserId] } }],
      },
    });

    if (existingChat) {
      await chatArchiveService.archiveChat(userId, existingChat.id);
    }

    // Create block record
    const block = await prisma.userBlock.create({
      data: {
        blockedId: blockedUserId,
        blockerId: userId,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days default
      },
    });

    // Send notification about block expiration
    await notificationService.show({
      recipient: userId,
      title: 'Block Review Reminder',
      body: 'A user block is expiring soon. Would you like to review it?',
      scheduledFor: new Date(
        block.expiresAt.getTime() - 7 * 24 * 60 * 60 * 1000
      ), // 7 days before expiry
    });

    return block;
  }

  async checkBlockStatus(userOneId: string, userTwoId: string) {
    const block = await prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: userOneId, blockedId: userTwoId },
          { blockerId: userTwoId, blockedId: userOneId },
        ],
        expiresAt: { gt: new Date() },
      },
    });

    return block !== null;
  }
}

export const blockService = new BlockService();
