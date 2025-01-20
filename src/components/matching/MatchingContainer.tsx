import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Match, MatchPreferences } from '@/types/match';
import { MatchSocketService } from '@/services/websocket/match.socket';
import { MatchList } from './MatchList';
import { MatchPreferencesPanel } from './MatchPreferencesPanel';
import { MatchMapView } from './MatchMapView';
import { useToast } from '@/components/ui/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function MatchingContainer() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'map'>('list');
  const { toast } = useToast();
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
      toast({
        title: 'Error',
        description: 'Failed to load matches. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleMatchAction = useCallback(async (matchId: string, action: string, reason?: string) => {
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });

      if (!response.ok) throw new Error('Failed to perform action');

      if (action === 'accept') {
        toast({
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
      toast({
        title: 'Error',
        description: 'Failed to perform action. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handlePreferencesUpdate = useCallback(async (preferences: MatchPreferences) => {
    try {
      const response = await fetch('/api/matches/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) throw new Error('Failed to update preferences');

      toast({
        title: 'Preferences Updated',
        description: 'Your matching preferences have been updated.',
      });

      // Refresh matches with new preferences
      await fetchMatches(preferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      });
    }
  }, [fetchMatches, toast]);

  // Setup WebSocket connection and listeners
  useEffect(() => {
    if (!session?.user?.id) return;

    socketService.connect(session.accessToken);

    const matchUpdateUnsub = socketService.subscribeToMatches((data) => {
      if (data.type === 'new') {
        setMatches(prev => [data.match, ...prev]);
        toast({
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
        toast({
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
  }, [session?.user?.id, session?.accessToken, socketService, fetchMatches, toast]);

  return (
    <div className="container mx-auto px-4 py-6">
      <MatchPreferencesPanel onUpdate={handlePreferencesUpdate} />
      
      <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'map')} className="mt-6">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <MatchList
            matches={matches}
            onAccept={id => handleMatchAction(id, 'accept')}
            onDecline={id => handleMatchAction(id, 'decline')}
            onBlock={id => handleMatchAction(id, 'block')}
            onReport={(id, reason) => handleMatchAction(id, 'report', reason)}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="map">
          <MatchMapView
            matches={matches}
            onMarkerClick={(match) => {
              // Handle map marker click
              toast({
                title: match.name,
                description: `${match.distance.toFixed(1)} km away`,
              });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
