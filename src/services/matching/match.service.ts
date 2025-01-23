import { MatchDbClient } from '../match/match.db';
import type { Match, MatchScore, MatchPreferences, MatchStatus } from '@/types/match';
import type { User } from '@/types/user';
import { calculateMatchScore } from '../match/match.algorithm';

export class MatchingService {
  private static instance: MatchingService;
  private dbClient: MatchDbClient;

  private constructor() {
    this.dbClient = MatchDbClient.getInstance();
  }

  public static getInstance(): MatchingService {
    if (!MatchingService.instance) {
      MatchingService.instance = new MatchingService();
    }
    return MatchingService.instance;
  }

  async findMatches(userId: string): Promise<Match[]> {
    return this.dbClient.findMatches(userId);
  }

  async getMatchStatus(userId: string, matchId: string): Promise<MatchStatus> {
    const match = await this.dbClient.getMatch(matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    return match.status;
  }

  async acceptMatch(userId: string, matchId: string): Promise<void> {
    const match = await this.dbClient.getMatch(matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    if (match.userId !== userId && match.matchedUserId !== userId) {
      throw new Error('Unauthorized');
    }
    match.status = 'accepted';
    await this.dbClient.saveMatch(match);
  }

  async rejectMatch(userId: string, matchId: string): Promise<void> {
    const match = await this.dbClient.getMatch(matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    if (match.userId !== userId && match.matchedUserId !== userId) {
      throw new Error('Unauthorized');
    }
    match.status = 'rejected';
    await this.dbClient.saveMatch(match);
  }

  async blockMatch(userId: string, matchId: string): Promise<void> {
    const match = await this.dbClient.getMatch(matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    if (match.userId !== userId && match.matchedUserId !== userId) {
      throw new Error('Unauthorized');
    }
    match.status = 'blocked';
    await this.dbClient.saveMatch(match);
  }

  async updatePreferences(userId: string, preferences: MatchPreferences): Promise<void> {
    await this.dbClient.updatePreferences(userId, preferences);
  }
}
