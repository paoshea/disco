import { useQuery } from '@tanstack/react-query';
import { Match } from '@/types/match';
import { MatchService } from '@/services/match/match.service';

export function useMatches(userId: string) {
  const matchService = MatchService.getInstance();

  return useQuery<Match[], Error>({
    queryKey: ['matches', userId],
    queryFn: () => matchService.findMatches(userId),
  });
}
