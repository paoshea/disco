
import prisma from '@/lib/prisma';
import type { Achievement, SafetyCheck, UserMatch, Event } from '@prisma/client';

export class ProgressService {
  async trackUserProgress(userId: string) {
    const [safetyChecks, matches, events] = await Promise.all([
      prisma.safetyCheck.count({ where: { userId } }),
      prisma.userMatch.count({ where: { userId, status: 'ACCEPTED' } }),
      prisma.eventParticipant.count({ where: { userId } })
    ]);

    const achievements: Achievement[] = [];

    // Safety milestone achievements
    if (safetyChecks >= 5) {
      achievements.push({
        userId,
        type: 'safety',
        name: 'Safety First',
        description: 'Completed 5 safety checks',
        earnedAt: new Date()
      } as Achievement);
    }

    // Match milestone achievements
    if (matches >= 3) {
      achievements.push({
        userId,
        type: 'social',
        name: 'Social Butterfly',
        description: 'Made 3 successful matches',
        earnedAt: new Date()
      } as Achievement);
    }

    // Event milestone achievements
    if (events >= 2) {
      achievements.push({
        userId,
        type: 'events',
        name: 'Event Explorer',
        description: 'Participated in 2 events',
        earnedAt: new Date()
      } as Achievement);
    }

    // Save new achievements
    if (achievements.length > 0) {
      await prisma.achievement.createMany({
        data: achievements,
        skipDuplicates: true
      });
    }

    return { safetyChecks, matches, events, achievements };
  }
}

export const progressService = new ProgressService();
