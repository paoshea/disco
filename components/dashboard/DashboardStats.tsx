import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  FireIcon,
  TrophyIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface Achievement {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
}

interface StreakStats {
  currentStreak: number;
  lastStreakUpdate: string | null;
  nextAchievementIn: number | null;
  latestAchievement: Achievement | null;
}

interface DashboardStatsProps {
  stats: {
    streakStats: StreakStats;
    newAchievement?: {
      name: string;
      description: string;
    } | null;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (stats.newAchievement) {
      setShowConfetti(true);
      toast.success(`🏆 Achievement Unlocked: ${stats.newAchievement.name}!`, {
        duration: 5000,
      });
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [stats.newAchievement]);

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Current Streak */}
        <div className="relative bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FireIcon
                  className="h-6 w-6 text-orange-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Current Streak
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.streakStats.currentStreak} days
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {stats.streakStats.nextAchievementIn
                  ? `${stats.streakStats.nextAchievementIn} days until next achievement!`
                  : "You've reached all achievements!"}
              </span>
            </div>
          </div>
        </div>

        {/* Latest Achievement */}
        <div className="relative bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrophyIcon
                  className="h-6 w-6 text-yellow-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Latest Achievement
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-lg font-semibold text-gray-900">
                      {stats.streakStats.latestAchievement
                        ? stats.streakStats.latestAchievement.name
                        : 'No achievements yet'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {stats.streakStats.latestAchievement
                  ? stats.streakStats.latestAchievement.description
                  : 'Keep logging in to earn achievements!'}
              </span>
            </div>
          </div>
        </div>

        {/* Last Update */}
        <div className="relative bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon
                  className="h-6 w-6 text-blue-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Last Update
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-lg font-semibold text-gray-900">
                      {stats.streakStats.lastStreakUpdate
                        ? new Date(
                            stats.streakStats.lastStreakUpdate
                          ).toLocaleDateString()
                        : 'Never'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {/* Add your preferred confetti animation library here */}
          🎉🎊✨
        </div>
      )}
    </div>
  );
}
