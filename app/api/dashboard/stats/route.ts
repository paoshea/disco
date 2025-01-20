import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

// Define types for our data
type Achievement = {
  id: string;
  userId: string;
  type: string;
  name: string;
  description: string;
  earnedAt: Date;
};

type UserWithStats = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  lastLogin: Date | null;
  streakCount: number;
  lastStreak: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

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

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user with raw SQL
    const user = await db.$queryRaw<[UserWithStats | null]>`
      SELECT 
        id, email, "firstName", "lastName", "emailVerified",
        "lastLogin", "streakCount", "lastStreak", "createdAt", "updatedAt"
      FROM "User"
      WHERE id = ${session.user.id}
    ` as { 
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      emailVerified: boolean;
      lastLogin: Date | null;
      streakCount: number;
      lastStreak: Date | null;
      createdAt: Date;
      updatedAt: Date;
    } | null;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch latest streak achievement with raw SQL
    const latestAchievement = await db.$queryRaw<[Achievement | undefined]>`
      SELECT *
      FROM "Achievement"
      WHERE "userId" = ${user.id}
        AND type = 'streak'
      ORDER BY "earnedAt" DESC
      LIMIT 1
    ` as Achievement | undefined;

    // Check for new achievements
    const newAchievement = await checkAndCreateAchievement(
      user.id,
      user.streakCount
    );

    // Calculate days until next achievement
    const nextAchievementThresholds = [7, 30, 100];
    const nextThreshold =
      nextAchievementThresholds.find(t => t > user.streakCount) || null;
    const daysUntilNextAchievement = nextThreshold
      ? nextThreshold - user.streakCount
      : null;

    return NextResponse.json({
      stats: {
        ...user,
        lastActive: user.lastLogin || user.updatedAt,
        memberSince: user.createdAt,
        streakStats: {
          currentStreak: user.streakCount,
          lastStreakUpdate: user.lastStreak,
          nextAchievementIn: daysUntilNextAchievement,
          latestAchievement: latestAchievement || null,
        },
        newAchievement,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
