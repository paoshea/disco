import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = cn(
    'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
    {
      // Size variations
      'px-2.5 py-1.5 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',

      // Variant variations
      'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500':
        variant === 'primary',
      'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500':
        variant === 'secondary',
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500':
        variant === 'danger',
      'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500':
        variant === 'ghost',
      'border-2 border-sky-600 bg-transparent text-sky-600 hover:bg-sky-50 focus:ring-sky-500':
        variant === 'outline',

      // Disabled state
      'opacity-50 cursor-not-allowed': disabled || loading,
    },
    className
  );

  return (
    <button className={baseStyles} disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
