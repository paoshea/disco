import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Match, MatchPreferences } from '@/types/match';
import { MatchSocketService } from '@/services/websocket/match.socket';
import { MatchList } from './MatchList';
import { MatchPreferencesPanel } from '@/components/matching/MatchPreferencesPanel';
import { MatchMapView } from './MatchMapView';
import { createToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ExtendedSession extends Omit<Session, 'user'> {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  accessToken?: string;
}

export function MatchingContainer() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'map'>('list');
  const socketService = MatchSocketService.getInstance();

  const fetchMatches = useCallback(async (preferences?: Partial<MatchPreferences>) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (preferences) {
        Object.entries(preferences).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              params.set(key, value.join(','));
            } else {
              params.set(key, String(value));
            }
          }
        });
      }

      const response = await fetch(`/api/matches?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      
      const data = await response.json();
      setMatches(data.matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      createToast.error({
        title: 'Error',
        description: 'Failed to load matches. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMatchAction = useCallback(async (matchId: string, action: string, reason?: string) => {
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });

      if (!response.ok) throw new Error('Failed to perform action');

      if (action === 'accept') {
        createToast.success({
          title: 'Match Accepted!',
          description: 'You can now start chatting.',
        });
      }

      // Remove match from list for decline/block actions
      if (action === 'decline' || action === 'block') {
        setMatches(prev => prev.filter(m => m.id !== matchId));
      }
    } catch (error) {
      console.error('Error performing match action:', error);
      createToast.error({
        title: 'Error',
        description: 'Failed to perform action. Please try again.',
      });
    }
  }, []);

  const handlePreferencesUpdate = useCallback(async (preferences: MatchPreferences) => {
    try {
      const response = await fetch('/api/matches/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) throw new Error('Failed to update preferences');

      createToast.success({
        title: 'Preferences Updated',
        description: 'Your matching preferences have been updated.',
      });

      // Refresh matches with new preferences
      await fetchMatches(preferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
      createToast.error({
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
      });
    }
  }, [fetchMatches]);

  const sortedMatches = useMemo(() => {
    return matches.sort((a, b) => {
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

    const matchUpdateUnsub = socketService.subscribeToMatches((data) => {
      if (data.type === 'new') {
        setMatches(prev => [data.match, ...prev]);
        createToast.success({
          title: 'New Match!',
          description: `${data.match.name} might be a good match for you.`,
        });
      } else if (data.type === 'update') {
        setMatches(prev =>
          prev.map(m => (m.id === data.match.id ? data.match : m))
        );
      } else if (data.type === 'remove') {
        setMatches(prev => prev.filter(m => m.id !== data.match.id));
      }
    });

    const matchActionUnsub = socketService.subscribeToActions((data) => {
      if (data.type === 'accepted') {
        createToast.success({
          title: 'Match Accepted!',
          description: 'Someone accepted your match request.',
        });
      }
    });

    // Initial fetch
    fetchMatches();

    return () => {
      matchUpdateUnsub();
      matchActionUnsub();
      socketService.disconnect();
    };
  }, [session?.user?.id, session?.accessToken, socketService, fetchMatches]);

  useEffect(() => {
    if (!session?.user) {
      createToast.error({
        title: 'Error',
        description: 'You must be logged in to view matches',
      });
      return;
    }
  }, [session]);

  return (
    <div className="container mx-auto px-4 py-6">
      <MatchPreferencesPanel onSubmit={handlePreferencesUpdate} />
      
      <Tabs value={view} onValueChange={(v: string) => setView(v as 'list' | 'map')} className="mt-6">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <MatchList
            matches={sortedMatches}
            onMatchClick={(matchId: string) => handleMatchAction(matchId, 'accept')}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="map">
          <MatchMapView
            matches={sortedMatches}
            onMarkerClick={(match) => {
              createToast.success({
                title: match.name,
                description: match.distance !== null 
                  ? `${match.distance}km away`
                  : 'Distance unknown',
              });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
