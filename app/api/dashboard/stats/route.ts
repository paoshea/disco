import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Define types for our data
// type Achievement = {
//   id: string;
//   type: string;
//   name: string;
//   description: string;
//   earnedAt: Date;
//   createdAt: Date;
//   updatedAt: Date;
// };

// type UserWithStats = {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   emailVerified: boolean;
//   lastLogin: Date | null;
//   streakCount: number;
//   lastStreak: Date | null;
//   createdAt: Date;
//   updatedAt: Date;
// };

async function checkAndCreateAchievement(userId: string, streakCount: number) {
  const streakAchievements = [
    {
      threshold: 7,
      name: 'Week Warrior',
      description: 'Logged in for 7 days straight!',
    },
    {
      threshold: 30,
      name: 'Monthly Master',
      description: 'Maintained a 30-day streak!',
    },
    {
      threshold: 100,
      name: 'Century Champion',
      description: 'Incredible! 100 days of consistent logins!',
    },
  ];

  for (const { threshold, name, description } of streakAchievements) {
    if (streakCount === threshold) {
      // Create achievement using raw SQL
      await prisma.$executeRaw`
        INSERT INTO "Achievement" ("userId", "type", "name", "description")
        VALUES (${userId}, 'streak', ${name}, ${description})
      `;

      return { name, description };
    }
  }

  return null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's current stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        streakCount: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for achievements based on streak count
    const achievement = await checkAndCreateAchievement(
      userId,
      user.streakCount || 0
    );

    // Get total events participated
    const eventsParticipated = await prisma.eventParticipant.count({
      where: {
        userId,
      },
    });

    // Get total events created
    const eventsCreated = await prisma.event.count({
      where: {
        creatorId: userId,
      },
    });

    return NextResponse.json({
      stats: {
        streakCount: user.streakCount || 0,
        eventsParticipated,
        eventsCreated,
      },
      achievement: achievement
        ? {
            name: achievement.name,
            description: achievement.description,
          }
        : null,
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
