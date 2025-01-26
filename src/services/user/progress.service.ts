
import { prisma } from '@/lib/prisma';
import type { Achievement, SafetyCheck, UserMatch, Event } from '@prisma/client';
import { notificationService } from '@/services/notifications/notification.service';
import { UserProgress, ProgressMilestone } from '@/types/user';

interface MilestoneReward {
  type: string;
  name: string;
  description: string;
  requirement: number;
  reward: {
    points?: number;
    badge?: string;
    role?: string;
  };
}

const MILESTONES: MilestoneReward[] = [
  {
    type: 'safety',
    name: 'Safety Champion',
    description: 'Complete 10 safety checks',
    requirement: 10,
    reward: {
      points: 100,
      badge: 'safety_champion'
    }
  },
  {
    type: 'social',
    name: 'Community Builder',
    description: 'Make 5 successful matches',
    requirement: 5,
    reward: {
      points: 150,
      badge: 'community_builder'
    }
  },
  {
    type: 'events',
    name: 'Event Master',
    description: 'Participate in 5 events',
    requirement: 5,
    reward: {
      points: 200,
      badge: 'event_master'
    }
  },
  {
    type: 'engagement',
    name: 'Power User',
    description: 'Earn 500 points',
    requirement: 500,
    reward: {
      role: 'power_user'
    }
  }
];

export class ProgressService {
  async trackUserProgress(userId: string) {
    const [safetyChecks, matches, events, user] = await Promise.all([
      prisma.safetyCheck.count({ where: { userId } }),
      prisma.userMatch.count({ where: { userId, status: 'ACCEPTED' } }),
      prisma.eventParticipant.count({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId } })
    ]);

    if (!user) return null;

    const achievements: Achievement[] = [];
    let points = 0;

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

    // Check milestones
    for (const milestone of MILESTONES) {
      const currentValue = milestone.type === 'safety' ? safetyChecks :
                          milestone.type === 'social' ? matches :
                          milestone.type === 'events' ? events :
                          milestone.type === 'engagement' ? points : 0;

      if (currentValue >= milestone.requirement) {
        // Add achievement if not already earned
        const existingAchievement = await prisma.achievement.findFirst({
          where: { userId, name: milestone.name }
        });

        if (!existingAchievement) {
          const achievement = await prisma.achievement.create({
            data: {
              userId,
              type: milestone.type,
              name: milestone.name,
              description: milestone.description,
              earnedAt: new Date()
            }
          });

          achievements.push(achievement);
          points += milestone.reward.points || 0;

          // Send notification
          await notificationService.show({
            title: 'New Achievement!',
            body: `You've earned the ${milestone.name} achievement!`,
            data: {
              type: 'achievement',
              achievementId: achievement.id
            }
          });

          // Handle role upgrade if applicable
          if (milestone.reward.role) {
            const currentUser = await prisma.user.findUnique({
              where: { id: userId },
              select: { role: true }
            });

            if (currentUser?.role !== milestone.reward.role) {
              await prisma.user.update({
                where: { id: userId },
                data: { role: milestone.reward.role }
              });

              // Send role upgrade notification
              await notificationService.show({
                title: 'Role Upgraded!',
                body: `You've been upgraded to ${milestone.reward.role.replace('_', ' ')}!`,
                data: {
                  type: 'role_upgrade',
                  newRole: milestone.reward.role
                }
              });

              // Create achievement for role upgrade
              await prisma.achievement.create({
                data: {
                  userId,
                  type: 'role',
                  name: 'Role Progression',
                  description: `Upgraded to ${milestone.reward.role.replace('_', ' ')}`,
                  earnedAt: new Date()
                }
              });
            }
          }
        }
      }
    }

    // Update user points
    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: points } }
    });

    return { safetyChecks, matches, events, achievements, pointsEarned: points };
  }

  async trackMeetupCompletion(userId: string, matchType: string) {
    const progress = await prisma.userProgress.upsert({
      where: { userId },
      update: {
        totalMeetups: { increment: 1 },
        [`${matchType}Meetups`]: { increment: 1 }
      },
      create: {
        userId,
        totalMeetups: 1,
        [`${matchType}Meetups`]: 1
      }
    });
    
    await this.checkMilestones(userId, progress);
  }

  async trackSafetyCompliance(userId: string) {
    return prisma.userProgress.upsert({
      where: { userId },
      update: {
        safetyCheckins: { increment: 1 },
        safetyScore: { increment: 5 }
      },
      create: {
        userId,
        safetyCheckins: 1,
        safetyScore: 5
      }
    });
  }

  async checkMilestones(userId: string, progress: UserProgress) {
    const milestones: ProgressMilestone[] = [
      { name: 'First Connection', requirement: progress.totalMeetups >= 1 },
      { name: 'Safety Champion', requirement: progress.safetyScore >= 100 },
      { name: 'Social Explorer', requirement: progress.uniqueLocations >= 5 },
      { name: 'Trusted Member', requirement: progress.positiveRatings >= 10 }
    ];

    for (const milestone of milestones) {
      if (milestone.requirement) {
        await prisma.userAchievement.create({
          data: {
            userId,
            name: milestone.name,
            awardedAt: new Date()
          }
        });
      }
    }
  }
}

export const progressService = new ProgressService();
