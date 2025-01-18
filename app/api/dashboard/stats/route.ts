import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

interface JWTPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user data with pending safety checks count
    const userData = await prisma.$queryRaw<
      Array<{
        id: string;
        streakCount: number;
        lastLogin: Date | null;
        pendingChecks: number;
      }>
    >`
      SELECT 
        u.id,
        u."streakCount",
        u."lastLogin",
        COUNT(sc.id) as "pendingChecks"
      FROM "User" u
      LEFT JOIN "SafetyCheck" sc ON sc."userId" = u.id AND sc.status = 'pending'
      WHERE u.id = ${userId}
      GROUP BY u.id
    `;

    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userData[0];

    // Calculate safety score
    const safetyScore = await calculateSafetyScore(user.id);

    return NextResponse.json({
      streakCount: user.streakCount,
      lastLogin: user.lastLogin,
      safetyScore,
      pendingChecks: Number(user.pendingChecks) || 0,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Error fetching dashboard stats' },
      { status: 500 }
    );
  }
}

async function calculateSafetyScore(userId: string): Promise<number> {
  const data = await prisma.$queryRaw<
    Array<{
      contactCount: number;
      completedChecks: number;
      totalChecks: number;
      hasEmail: boolean;
      hasName: boolean;
    }>
  >`
    SELECT 
      COUNT(DISTINCT ec.id) as "contactCount",
      COUNT(CASE WHEN sc.status = 'completed' THEN 1 END) as "completedChecks",
      COUNT(DISTINCT sc.id) as "totalChecks",
      CASE WHEN u.email IS NOT NULL THEN true ELSE false END as "hasEmail",
      CASE WHEN u."firstName" IS NOT NULL AND u."lastName" IS NOT NULL THEN true ELSE false END as "hasName"
    FROM "User" u
    LEFT JOIN "EmergencyContact" ec ON ec."userId" = u.id
    LEFT JOIN "SafetyCheck" sc ON sc."userId" = u.id 
      AND sc."createdAt" >= NOW() - INTERVAL '30 days'
    WHERE u.id = ${userId}
    GROUP BY u.id, u.email, u."firstName", u."lastName"
  `;

  if (!data || data.length === 0) return 0;

  const stats = data[0];
  let score = 0;

  // Emergency contacts (30 points max)
  const contactScore = Math.min(Number(stats.contactCount) * 10, 30);
  score += contactScore;

  // Safety check completion rate (40 points max)
  const completedChecks = Number(stats.completedChecks);
  const totalChecks = Number(stats.totalChecks);
  const checkScore =
    totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 40) : 0;
  score += checkScore;

  // Profile completion (30 points max)
  let profileScore = 0;
  if (stats.hasEmail) profileScore += 10;
  if (stats.hasName) profileScore += 10;
  if (Number(stats.contactCount) > 0) profileScore += 10;
  score += profileScore;

  return score;
}
