import { Match, MatchPreferences } from '@/types/match';
import { api } from './api';

class MatchService {
  async getMatches(): Promise<Match[]> {
    const response = await api.get('/matches');
    return response.data;
  }

  async getMatch(matchId: string): Promise<Match> {
    const response = await api.get(`/matches/${matchId}`);
    return response.data;
  }

  async likeProfile(userId: string): Promise<Match | null> {
    const response = await api.post(`/matches/like/${userId}`);
    return response.data;
  }

  async dislikeProfile(userId: string): Promise<void> {
    await api.post(`/matches/dislike/${userId}`);
  }

  async unmatch(matchId: string): Promise<void> {
    await api.delete(`/matches/${matchId}`);
  }

  async updatePreferences(preferences: MatchPreferences): Promise<void> {
    await api.put('/matches/preferences', preferences);
  }

  async getRecommendations(): Promise<Match[]> {
    const response = await api.get('/matches/recommendations');
    return response.data;
  }

  async getPendingMatches(): Promise<Match[]> {
    const response = await api.get('/matches/pending');
    return response.data;
  }

  async acceptMatch(matchId: string): Promise<Match> {
    const response = await api.post(`/matches/${matchId}/accept`);
    return response.data;
  }

  async declineMatch(matchId: string): Promise<void> {
    await api.post(`/matches/${matchId}/decline`);
  }

  async pauseMatching(): Promise<void> {
    await api.post('/matches/pause');
  }

  async resumeMatching(): Promise<void> {
    await api.post('/matches/resume');
  }

  async reportMatch(matchId: string, reason: string): Promise<void> {
    await api.post(`/matches/${matchId}/report`, { reason });
  }

  async blockMatch(matchId: string): Promise<void> {
    await api.post(`/matches/${matchId}/block`);
  }
}

export const matchService = new MatchService();
