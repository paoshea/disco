import { prisma } from '@/lib/prisma';
import { preferencesService } from '../preferences/preferences.service';
import type { Match, MatchRequest } from '@/types/matching';

export const matchingService = {
  async findMatches(userId: string): Promise<Match[]> {
    const userPreferences = await preferencesService.getPreferences(userId);
    
    return prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { preferences: { activityTypes: { hasSome: userPreferences.activityTypes } } },
          {
            age: {
              gte: userPreferences.ageRange[0],
              lte: userPreferences.ageRange[1],
            },
          },
        ],
      },
      include: {
        preferences: true,
        activities: true,
      },
    }).then(users => users.map(user => this._calculateMatch(user, userPreferences)));
  },

  async getMatchDetails(matchId: string): Promise<Match> {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        user: {
          include: {
            preferences: true,
            activities: true,
          },
        },
      },
    });

    if (!match) throw new Error('Match not found');
    return match;
  },

  async sendMatchRequest(matchId: string, userId: string): Promise<MatchRequest> {
    return prisma.matchRequest.create({
      data: {
        matchId,
        userId,
        status: 'pending',
      },
    });
  },

  async updateMatchStatus(requestId: string, status: 'accepted' | 'declined'): Promise<MatchRequest> {
    return prisma.matchRequest.update({
      where: { id: requestId },
      data: { status },
    });
  },

  async getMatchUpdates(userId: string, callback: (match: Match) => void): Promise<() => void> {
    // Subscribe to match updates
    const unsubscribe = prisma.$subscribe.match({
      where: {
        OR: [
          { userId },
          { matchedUserId: userId },
        ],
      },
    }).on('change', async (change) => {
      if (change.type === 'update') {
        const match = await this.getMatchDetails(change.id);
        callback(match);
      }
    });

    return unsubscribe;
  },

  _calculateMatch(user: any, preferences: any): Match {
    // Calculate match score based on various factors
    let score = 0;
    let commonInterests = [];

    // Activity type matching
    const commonActivities = user.preferences.activityTypes.filter(
      (type: string) => preferences.activityTypes.includes(type)
    );
    score += commonActivities.length / Math.max(preferences.activityTypes.length, user.preferences.activityTypes.length);
    commonInterests = commonActivities;

    // Experience level matching
    if (user.preferences.experienceLevel === preferences.experienceLevel) {
      score += 0.2;
    }

    // Availability matching
    const commonAvailability = user.preferences.availability.filter(
      (time: string) => preferences.availability.includes(time)
    );
    score += commonAvailability.length / Math.max(preferences.availability.length, user.preferences.availability.length) * 0.3;

    return {
      id: user.id,
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      matchScore: Math.min(score, 1),
      commonInterests,
      lastActive: user.lastActive,
      status: 'pending',
    };
  },
};
