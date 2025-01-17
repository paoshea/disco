import { AxiosResponse } from 'axios';
import { Match, MatchPreferences, MatchStatus } from '@/types/match';
import { api } from './api';

interface MatchResponse {
  match: Match;
  score: number;
}

interface MatchCreateData {
  userId: string;
  preferences: MatchPreferences;
}

interface MatchUpdateData {
  preferences?: MatchPreferences;
  status?: 'active' | 'paused' | 'completed';
}

class MatchService {
  async getMatches(): Promise<MatchResponse[]> {
    try {
      const response: AxiosResponse<{ matches: MatchResponse[] }> = await api.get('/matches');
      return response.data.matches;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getMatch(matchId: string): Promise<MatchResponse> {
    try {
      const response: AxiosResponse<{ match: MatchResponse }> = await api.get(
        `/matches/${matchId}`
      );
      return response.data.match;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async likeProfile(userId: string): Promise<Match | null> {
    try {
      const response: AxiosResponse<Match | null> = await api.post(`/matches/like/${userId}`);
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async dislikeProfile(userId: string): Promise<void> {
    try {
      await api.post(`/matches/dislike/${userId}`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async unmatch(matchId: string): Promise<void> {
    try {
      await api.delete(`/matches/${matchId}`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updatePreferences(preferences: MatchPreferences): Promise<void> {
    try {
      await api.put('/matches/preferences', preferences);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getRecommendations(limit: number = 10): Promise<Match[]> {
    try {
      const response: AxiosResponse<Match[]> = await api.get('/matches/recommendations', {
        params: { limit },
      });
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getPendingMatches(): Promise<Match[]> {
    try {
      const response: AxiosResponse<Match[]> = await api.get('/matches/pending');
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async acceptMatch(matchId: string): Promise<Match> {
    try {
      const response: AxiosResponse<Match> = await api.post(`/matches/${matchId}/accept`);
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async declineMatch(matchId: string): Promise<void> {
    try {
      await api.post(`/matches/${matchId}/decline`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async pauseMatching(duration?: number): Promise<void> {
    try {
      await api.post('/matches/pause', { duration });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async resumeMatching(): Promise<void> {
    try {
      await api.post('/matches/resume');
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getMatchStatus(): Promise<MatchStatus> {
    try {
      const response: AxiosResponse<{ status: MatchStatus }> = await api.get('/matches/status');
      return response.data.status;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async reportMatch(matchId: string, reason: string): Promise<void> {
    try {
      await api.post(`/matches/${matchId}/report`, { reason });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async blockMatch(matchId: string): Promise<void> {
    try {
      await api.post(`/matches/${matchId}/block`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred');
  }
}

export const matchService = new MatchService();
