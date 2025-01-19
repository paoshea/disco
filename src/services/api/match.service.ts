import { Match, MatchPreferences, MatchStatus } from '@/types/match';
import { apiClient } from './api.client';
import { ApiResponse } from './api';

interface GetMatchesParams {
  page?: number;
  limit?: number;
  sortBy?: keyof Match;
  status?: MatchStatus;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
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
}

interface MatchStatusResponse {
  status: MatchStatus;
}

class MatchService {
  private readonly baseUrl = '/matches';

  async getMatches(params?: GetMatchesParams): Promise<Match[]> {
    const response = await apiClient.get<ApiResponse<MatchesResponse>>(
      this.baseUrl,
      { params }
    );
    return response.data.data.matches;
  }

  async getMatch(matchId: string): Promise<Match | null> {
    try {
      const response = await apiClient.get<ApiResponse<MatchResponse>>(
        `${this.baseUrl}/${matchId}`
      );
      return response.data.data.match;
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        return null;
      }
      throw this.handleError(err);
    }
  }

  async likeProfile(userId: string): Promise<Match | null> {
    try {
      const response = await apiClient.post<ApiResponse<MatchResponse>>(
        `${this.baseUrl}/like/${userId}`
      );
      return response.data.data.match;
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        return null;
      }
      throw this.handleError(err);
    }
  }

  async dislikeProfile(userId: string): Promise<void> {
    try {
      await apiClient.post<ApiResponse<void>>(
        `${this.baseUrl}/dislike/${userId}`
      );
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async acceptMatch(matchId: string): Promise<void> {
    try {
      await apiClient.post<ApiResponse<void>>(
        `${this.baseUrl}/${matchId}/accept`
      );
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async rejectMatch(matchId: string): Promise<void> {
    try {
      await apiClient.post<ApiResponse<void>>(
        `${this.baseUrl}/${matchId}/reject`
      );
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async unmatch(matchId: string): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${matchId}`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updatePreferences(
    preferences: Partial<MatchPreferences>
  ): Promise<void> {
    try {
      await apiClient.put<ApiResponse<void>, Partial<MatchPreferences>>(
        `${this.baseUrl}/preferences`,
        preferences
      );
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updateMatchStatus(
    matchId: string,
    status: MatchStatus
  ): Promise<Match> {
    try {
      const response = await apiClient.put<ApiResponse<MatchResponse>>(
        `${this.baseUrl}/${matchId}/status`,
        { status }
      );
      return response.data.data.match;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getMatchStatus(matchId: string): Promise<MatchStatus> {
    try {
      const response = await apiClient.get<ApiResponse<MatchStatusResponse>>(
        `${this.baseUrl}/${matchId}/status`
      );
      return response.data.data.status;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getRecommendations(limit = 10): Promise<Match[]> {
    try {
      const response = await apiClient.get<ApiResponse<MatchesResponse>>(
        `${this.baseUrl}/recommendations`,
        { params: { limit } }
      );
      return response.data.data.matches;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getPendingMatches(): Promise<Match[]> {
    try {
      const response = await apiClient.get<ApiResponse<MatchesResponse>>(
        `${this.baseUrl}/pending`
      );
      return response.data.data.matches;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async acceptMatchRequest(matchId: string): Promise<Match> {
    try {
      const response = await apiClient.post<ApiResponse<MatchResponse>>(
        `${this.baseUrl}/${matchId}/accept`
      );
      return response.data.data.match;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async declineMatchRequest(matchId: string): Promise<void> {
    try {
      await apiClient.post<ApiResponse<void>>(
        `${this.baseUrl}/${matchId}/decline`
      );
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async deleteMatch(matchId: string): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${matchId}`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async pauseMatching(duration?: number): Promise<void> {
    try {
      await apiClient.post<ApiResponse<void>>(`${this.baseUrl}/pause`, {
        duration,
      });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async resumeMatching(): Promise<void> {
    try {
      await apiClient.post<ApiResponse<void>>(`${this.baseUrl}/resume`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async reportMatch(matchId: string, reason: string): Promise<void> {
    try {
      await apiClient.post<ApiResponse<void>>(
        `${this.baseUrl}/${matchId}/report`,
        { reason }
      );
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async blockMatch(matchId: string): Promise<void> {
    try {
      await apiClient.post<ApiResponse<void>>(
        `${this.baseUrl}/${matchId}/block`
      );
    } catch (err) {
      throw this.handleError(err);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred in MatchService');
  }
}

export const matchService = new MatchService();
