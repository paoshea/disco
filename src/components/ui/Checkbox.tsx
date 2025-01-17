import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            ref={ref}
            className={cn(
              'h-4 w-4 rounded border-gray-300 text-primary-600',
              'focus:ring-primary-500 focus:ring-offset-0',
              error && 'border-red-500',
              className
            )}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label className={cn('font-medium', error ? 'text-red-700' : 'text-gray-700')}>
              {label}
            </label>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        )}
        {error && !label && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
