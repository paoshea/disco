import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
// Define the Achievement type if it does not exist
interface Achievement {
  id: string;
  name: string;
}
import { ProgressNotifications } from '@/components/profile/ProgressNotifications';

interface ProgressStats {
  safetyChecks: number;
  matches: number;
  events: number;
  achievements: Achievement[];
  pointsEarned: number;
}

export const ProgressDashboard = ({
  stats,
  user,
}: {
  stats: ProgressStats;
  user: { id: string };
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Progress</h2>
      <ProgressNotifications userId={user.id} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold">Safety Checks</h3>
          <p className="text-2xl">{stats.safetyChecks}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Matches</h3>
          <p className="text-2xl">{stats.matches}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Events</h3>
          <p className="text-2xl">{stats.events}</p>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Achievements</h3>
        <div className="flex flex-wrap gap-2">
          {stats.achievements.map(achievement => (
            <Badge key={achievement.id} variant="achievement">
              {achievement.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2">Points Earned</h3>
        <div className="text-3xl font-bold text-green-600">
          {stats.pointsEarned}
        </div>
      </div>
    </div>
  );
};
