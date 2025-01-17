import React from 'react';
import clsx from 'clsx';
import { UserCircleIcon } from '@heroicons/react/24/solid';

interface AvatarProps {
  userId: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  userId,
  imageUrl,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-14 w-14',
  };

  if (!imageUrl) {
    return (
      <div
        className={clsx(
          'relative inline-flex items-center justify-center rounded-full bg-gray-100',
          sizeClasses[size],
          className
        )}
      >
        <UserCircleIcon
          className="text-gray-400"
          aria-hidden="true"
        />
        <span className="sr-only">Avatar for user {userId}</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`Avatar for user ${userId}`}
      className={clsx(
        'rounded-full object-cover',
        sizeClasses[size],
        className
      )}
    />
  );
};
