import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'achievement';
  type?: string;
}

export const Badge = ({ children, variant = 'default', type }: BadgeProps) => {
  const getAchievementColor = (type: string | undefined) => {
    switch (type) {
      case 'safety':
        return 'bg-green-100 text-green-800';
      case 'social':
        return 'bg-purple-100 text-purple-800';
      case 'events':
        return 'bg-yellow-100 text-yellow-800';
      case 'engagement':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variant === 'achievement' ? getAchievementColor(type) : 'bg-blue-100 text-blue-800'
      )}
    >
      {children}
    </span>
  );
};