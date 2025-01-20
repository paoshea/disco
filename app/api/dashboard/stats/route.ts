import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerAuthSession } from '@/lib/auth';
import type { UserWithStats, Achievement } from '@/types/dashboard';

// Define types for our data
// type Achievement = {
//   id: string;
//   userId: string;
//   type: string;
//   level: string;
//   progress: string;
//   completedAt: Date | null;
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
      await db.$executeRaw`
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

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user stats
    const userWithStats = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        lastLogin: true,
        streakCount: true,
        lastStreak: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userWithStats) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user achievements
    const achievement = await db.achievement.findFirst({
      where: {
        userId: session.user.id,
        type: 'STREAK',
      },
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
        earnedAt: true,
      },
    });

    // Transform achievement to match expected types
    const transformedAchievement = achievement
      ? ({
          id: achievement.id,
          type: achievement.type as Achievement['type'],
          level: 1, // Default level since not in schema
          progress: 100, // Default progress since not in schema
          completedAt: achievement.earnedAt,
        } satisfies Achievement)
      : null;

    return NextResponse.json({
      user: {
        ...userWithStats,
        lastLogin: userWithStats.lastLogin || null,
        streakCount: userWithStats.streakCount || 0,
        lastStreak: userWithStats.lastStreak || null,
      } satisfies UserWithStats,
      achievement: transformedAchievement,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
