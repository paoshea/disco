import type { NextPage } from 'next';
import { Layout } from '@/components/layout/Layout';
import { MatchCard } from '@/components/matching/MatchCard';
import { MatchPreview } from '@/types/match';

const HomePage: NextPage = () => {
  // This is just mock data for now
  const mockMatch: MatchPreview = {
    id: '1',
    name: 'John Doe',
    distance: 0.5,
    commonInterests: ['Music', 'Coffee', 'Tech'],
    lastActive: new Date().toISOString(),
  };

  const handleAccept = (matchId: string) => {
    console.log('Accepted match:', matchId);
  };

  const handleDecline = (matchId: string) => {
    console.log('Declined match:', matchId);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Nearby Connections</h1>
        <div className="space-y-6">
          <MatchCard match={mockMatch} onAccept={handleAccept} onDecline={handleDecline} />
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
