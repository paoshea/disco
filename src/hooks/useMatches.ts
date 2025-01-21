import { useState, useEffect } from 'react';
import { Match } from '@/types/match';
import { matchService } from '@/services/api/match.service';

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const matchesData = await matchService.getMatches();
        setMatches(matchesData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch matches')
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchMatches();
  }, []);

  const refreshMatches = async () => {
    try {
      setLoading(true);
      const matchesData = await matchService.getMatches();
      setMatches(matchesData);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch matches')
      );
    } finally {
      setLoading(false);
    }
  };

  return { matches, loading, error, refreshMatches };
}
