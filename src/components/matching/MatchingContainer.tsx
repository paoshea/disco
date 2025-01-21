import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Match, MatchPreferences } from '@/types/match';
import { MatchSocketService } from '@/services/websocket/match.socket';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MatchList } from './MatchList';
import { MatchMapView } from './MatchMapView';
import { MatchPreferencesPanel } from './MatchPreferencesPanel';

interface ExtendedSession extends Session {
  accessToken?: string;
}

interface MatchUpdate {
  type: 'new' | 'update' | 'remove';
  match: Match;
}

interface MatchActionEvent {
  type: 'accepted' | 'declined' | 'blocked';
  matchId: string;
}

export function MatchingContainer() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'map'>('list');
  const { toast: createToast } = useToast();
  const socketService = MatchSocketService.getInstance();

  const fetchMatches = useCallback(
    async (preferences?: MatchPreferences) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
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
        console.error('Error fetching matches:', error);
        createToast({
          title: 'Error',
          description: 'Failed to load matches. Please try again.',
          variant: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [createToast]
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
          body: JSON.stringify(preferences),
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
    [fetchMatches, createToast]
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

  // Setup WebSocket connection and listeners
  useEffect(() => {
    if (!session?.user?.id) return;

    socketService.connect(session.accessToken ?? '');

    const matchUpdateUnsub = socketService.subscribeToMatches(
      (data: MatchUpdate) => {
        if (data.type === 'new') {
          setMatches(prev => [data.match, ...prev]);
          createToast({
            title: 'New Match!',
            description: `${data.match.name} might be a good match for you.`,
            variant: 'success',
          });
        } else if (data.type === 'update') {
          setMatches(prev =>
            prev.map(m => (m.id === data.match.id ? data.match : m))
          );
        } else if (data.type === 'remove') {
          setMatches(prev => prev.filter(m => m.id !== data.match.id));
        }
      }
    );

    const matchActionUnsub = socketService.subscribeToActions(
      (data: MatchActionEvent) => {
        if (data.type === 'accepted') {
          createToast({
            title: 'Match Accepted!',
            description: 'Someone accepted your match request.',
            variant: 'success',
          });
        }
      }
    );

    // Initial fetch
    void fetchMatches();

    return () => {
      matchUpdateUnsub();
      matchActionUnsub();
      socketService.disconnect();
    };
  }, [
    session?.user?.id,
    session?.accessToken,
    socketService,
    fetchMatches,
    createToast,
  ]);

  useEffect(() => {
    if (!session?.user) {
      createToast({
        title: 'Error',
        description: 'You must be logged in to view matches',
        variant: 'error',
      });
      return;
    }
  }, [session, createToast]);

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
