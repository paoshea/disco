import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { Match, MatchPreferences } from '@/types/match';
import { MatchSocketService } from '@/services/websocket/match.socket';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MatchList } from './MatchList';
import { MatchMapView } from './MatchMapView';
import { MatchPreferencesPanel } from './MatchPreferencesPanel';

interface MatchUpdate {
  type: 'new' | 'update' | 'remove';
  match: Match;
}

interface MatchingContainerProps {
  userId: string;
}

export function MatchingContainer({ userId }: MatchingContainerProps) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'map'>('list');
  const { toast: createToast } = useToast();
  const socketService = MatchSocketService.getInstance();

  const fetchMatches = useCallback(
    async (preferences?: MatchPreferences) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ userId });
        if (preferences) {
          Object.entries(preferences).forEach(([key, value]) => {
            if (value !== undefined) {
              params.append(key, String(value));
            }
          });
        }

        const response = await fetch(`/api/matches?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch matches');

        const data = (await response.json()) as { matches: Match[] };
        setMatches(data.matches);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
        createToast({
          title: 'Error',
          description: 'Failed to fetch matches. Please try again.',
          variant: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [userId, createToast]
  );

  const handleMatchAction = useCallback(
    async (
      matchId: string,
      action: 'accept' | 'decline' | 'block',
      reason?: string
    ) => {
      try {
        const response = await fetch(`/api/matches/${matchId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, reason }),
        });

        if (!response.ok) throw new Error('Failed to perform action');

        if (action === 'accept') {
          createToast({
            title: 'Match Accepted!',
            description: 'You can now start chatting.',
            variant: 'success',
          });
        }

        // Remove match from list for decline/block actions
        if (action === 'decline' || action === 'block') {
          setMatches(prev => prev.filter(m => m.id !== matchId));
        }
      } catch (error) {
        console.error('Error performing match action:', error);
        createToast({
          title: 'Error',
          description: 'Failed to perform action. Please try again.',
          variant: 'error',
        });
      }
    },
    [createToast]
  );

  const handlePreferencesUpdate = useCallback(
    async (preferences: MatchPreferences) => {
      try {
        const response = await fetch('/api/matches/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            preferences,
          }),
        });

        if (!response.ok) throw new Error('Failed to update preferences');

        createToast({
          title: 'Preferences Updated',
          description: 'Your matching preferences have been updated.',
          variant: 'success',
        });

        // Refresh matches with new preferences
        await fetchMatches(preferences);
      } catch (error) {
        console.error('Error updating preferences:', error);
        createToast({
          title: 'Error',
          description: 'Failed to update preferences. Please try again.',
          variant: 'error',
        });
      }
    },
    [userId, fetchMatches, createToast]
  );

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      // Sort by distance if available
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      // If one has distance and other doesn't, prioritize the one with distance
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      // If neither has distance, sort by match score
      return (b.matchScore?.total || 0) - (a.matchScore?.total || 0);
    });
  }, [matches]);

  useEffect(() => {
    void fetchMatches();
  }, [fetchMatches]);

  useEffect(() => {
    if (!userId) return;

    const handleMatchUpdate = (update: MatchUpdate) => {
      setMatches(prevMatches => {
        switch (update.type) {
          case 'new':
            return [...prevMatches, update.match];
          case 'update':
            return prevMatches.map(m =>
              m.id === update.match.id ? update.match : m
            );
          case 'remove':
            return prevMatches.filter(m => m.id !== update.match.id);
          default:
            return prevMatches;
        }
      });
    };

    socketService.connect(userId);
    const unsubscribe = socketService.subscribeToMatches(handleMatchUpdate);

    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, [userId, socketService]);

  useEffect(() => {
    if (!user) {
      createToast({
        title: 'Error',
        description: 'You must be logged in to view matches',
        variant: 'error',
      });
      return;
    }
  }, [user, createToast]);

  return (
    <div className="container mx-auto px-4 py-6">
      <MatchPreferencesPanel
        onSubmit={prefs => {
          void handlePreferencesUpdate(prefs);
        }}
      />

      <Tabs
        value={view}
        onValueChange={(v: string) => setView(v as 'list' | 'map')}
        className="mt-6"
      >
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <MatchList
            matches={sortedMatches}
            onMatchClick={(matchId: string) => {
              void handleMatchAction(matchId, 'accept');
            }}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="map">
          <MatchMapView
            matches={sortedMatches}
            onMarkerClick={match => {
              void handleMatchAction(match.id, 'accept');
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
