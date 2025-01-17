import React from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'secondary' | 'white';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  color = 'primary',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const colorClasses = {
    primary: 'border-primary-600',
    secondary: 'border-secondary-600',
    white: 'border-white',
  };

  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-solid',
        sizeClasses[size],
        colorClasses[color],
        'border-t-transparent',
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
