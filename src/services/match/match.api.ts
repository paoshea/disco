import { Match, MatchPreview, MatchPreferences, MatchStatus } from '@/types/match';
import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/lib/api/types';

interface GetMatchesParams {
  page?: number;
  limit?: number;
  sortBy?: keyof Match;
  status?: MatchStatus;
  latitude?: number;
  longitude?: number;
  radius?: number;
  timeWindow?: 'anytime' | 'now' | '15min' | '30min' | '1hour' | 'today';
  activityType?: string;
  privacyMode?: 'standard' | 'strict';
  useBluetoothProximity?: boolean;
}

interface MatchResponse {
  match: Match;
}

interface MatchesResponse {
  matches: Match[];
  total: number;
  page: number;
  limit: number;
}

export class MatchApiClient {
  private readonly baseUrl = '/matches';

  async getMatches(params?: GetMatchesParams): Promise<MatchesResponse> {
    try {
      const response = await apiClient.get<MatchesResponse>(this.baseUrl, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMatch(matchId: string): Promise<Match | null> {
    try {
      const response = await apiClient.get<MatchResponse>(`${this.baseUrl}/${matchId}`);
      return response.data.match;
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      throw this.handleError(error);
    }
  }

  async updatePreferences(userId: string, preferences: MatchPreferences): Promise<void> {
    try {
      await apiClient.put(`${this.baseUrl}/preferences/${userId}`, preferences);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async likeProfile(userId: string): Promise<Match | null> {
    try {
      const response = await apiClient.post<MatchResponse>(`${this.baseUrl}/like/${userId}`);
      return response.data.match;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async dislikeProfile(userId: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/dislike/${userId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async acceptMatch(matchId: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/${matchId}/accept`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async rejectMatch(matchId: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/${matchId}/reject`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async blockMatch(matchId: string, reason?: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/${matchId}/block`, { reason });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async reportMatch(matchId: string, reason: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/${matchId}/report`, { reason });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(err: unknown): Error {
    console.error('Match API Error:', err);
    if (err instanceof Error) {
      return err;
    }
    return new Error('An unknown error occurred');
  }
}
