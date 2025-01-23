import { Match, MatchPreferences } from '@/types/match';
import { MatchApiClient } from './match.api';
import { MatchDbClient } from './match.db';

export class MatchService {
  private static instance: MatchService;
  private apiClient: MatchApiClient;
  private dbClient: MatchDbClient;

  private constructor() {
    this.apiClient = new MatchApiClient();
    this.dbClient = MatchDbClient.getInstance();
  }

  public static getInstance(): MatchService {
    if (!MatchService.instance) {
      MatchService.instance = new MatchService();
    }
    return MatchService.instance;
  }

  async getMatch(matchId: string): Promise<Match | null> {
    try {
      // First try to get from cache
      const cachedMatch = await this.dbClient.getMatch(matchId);
      if (cachedMatch) return cachedMatch;

      // If not in cache, fetch from API
      const match = await this.apiClient.getMatch(matchId);
      if (match) {
        await this.dbClient.saveMatch(match);
      }
      return match;
    } catch (error) {
      console.error('Failed to get match:', error);
      // Fallback to cache
      return this.dbClient.getMatch(matchId);
    }
  }

  async findMatches(userId: string): Promise<Match[]> {
    try {
      // Get matches from both sources
      const [dbMatches, apiResponse] = await Promise.all([
        this.dbClient.findMatches(userId),
        this.apiClient.getMatches({ limit: 50 }),
      ]);

      // Combine and deduplicate matches
      const apiMatches = apiResponse.matches;
      const allMatches = [...dbMatches];
      
      for (const apiMatch of apiMatches) {
        if (!dbMatches.some(m => m.id === apiMatch.id)) {
          allMatches.push(apiMatch);
          // Store new matches in DB
          await this.dbClient.saveMatch(apiMatch);
        }
      }

      return allMatches;
    } catch (error) {
      console.error('Failed to find matches:', error);
      return this.dbClient.findMatches(userId);
    }
  }

  async updatePreferences(userId: string, preferences: MatchPreferences): Promise<void> {
    try {
      // Update both DB and API
      await Promise.all([
        this.dbClient.updatePreferences(userId, preferences),
        this.apiClient.updatePreferences(userId, preferences),
      ]);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      // Still try to update DB if API fails
      await this.dbClient.updatePreferences(userId, preferences);
    }
  }

  async likeProfile(userId: string): Promise<Match | null> {
    try {
      const match = await this.apiClient.likeProfile(userId);
      if (match) {
        await this.dbClient.saveMatch(match);
      }
      return match;
    } catch (error) {
      console.error('Failed to like profile:', error);
      throw error;
    }
  }

  async dislikeProfile(userId: string): Promise<void> {
    try {
      await this.apiClient.dislikeProfile(userId);
    } catch (error) {
      console.error('Failed to dislike profile:', error);
      throw error;
    }
  }

  async acceptMatch(matchId: string): Promise<void> {
    try {
      await this.apiClient.acceptMatch(matchId);
      const match = await this.getMatch(matchId);
      if (match) {
        await this.dbClient.saveMatch({
          ...match,
          status: 'accepted',
        });
      }
    } catch (error) {
      console.error('Failed to accept match:', error);
      throw error;
    }
  }

  async rejectMatch(matchId: string): Promise<void> {
    try {
      await this.apiClient.rejectMatch(matchId);
      const match = await this.getMatch(matchId);
      if (match) {
        await this.dbClient.saveMatch({
          ...match,
          status: 'rejected',
        });
      }
    } catch (error) {
      console.error('Failed to reject match:', error);
      throw error;
    }
  }

  async blockMatch(matchId: string, reason?: string): Promise<void> {
    try {
      await this.apiClient.blockMatch(matchId, reason);
      const match = await this.getMatch(matchId);
      if (match) {
        await this.dbClient.saveMatch({
          ...match,
          status: 'blocked',
        });
      }
    } catch (error) {
      console.error('Failed to block match:', error);
      throw error;
    }
  }

  async reportMatch(matchId: string, reason: string): Promise<void> {
    try {
      await this.apiClient.reportMatch(matchId, reason);
    } catch (error) {
      console.error('Failed to report match:', error);
      throw error;
    }
  }
}
