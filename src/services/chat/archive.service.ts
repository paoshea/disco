import { prisma } from '@/lib/prisma';
import { encryptMessage, decryptMessage } from '@/utils/encryption';

export class ChatArchiveService {
  async archiveChat(userId: string, chatId: string) {
    const messages = await prisma.message.findMany({
      where: { chatRoomId: chatId },
      orderBy: { createdAt: 'asc' },
    });

    const encryptedArchive = encryptMessage(JSON.stringify(messages));

    return prisma.chatArchive.create({
      data: {
        userId,
        chatId,
        content: encryptedArchive,
        retentionDays: 30, // Default 30 day retention
        status: 'ACTIVE',
      },
    });
  }

  async getArchivedChat(archiveId: string) {
    const archive = await prisma.chatArchive.findUnique({
      where: {
        id: archiveId,
      },
    });

    if (!archive) return null;

    const decryptedContent = decryptMessage(archive.content);
    return JSON.parse(decryptedContent);
  }
}

export const chatArchiveService = new ChatArchiveService();
