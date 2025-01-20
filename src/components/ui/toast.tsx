import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';

interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  variant = 'default',
  onDismiss,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-6 shadow-lg transition-all',
        {
          'bg-white border-gray-200': variant === 'default',
          'bg-red-50 border-red-200': variant === 'destructive',
        }
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title && (
            <p
              className={cn('text-sm font-medium', {
                'text-gray-900': variant === 'default',
                'text-red-900': variant === 'destructive',
              })}
            >
              {title}
            </p>
          )}
          {description && (
            <p
              className={cn('mt-1 text-sm', {
                'text-gray-500': variant === 'default',
                'text-red-700': variant === 'destructive',
              })}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className={cn(
          'flex rounded-md p-1 transition-colors hover:bg-gray-100',
          {
            'hover:bg-red-100': variant === 'destructive',
          }
        )}
      >
        <XMarkIcon className="h-5 w-5 text-gray-400" />
        <span className="sr-only">Dismiss toast</span>
      </button>
    </motion.div>
  );
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <div className="fixed bottom-0 right-0 z-50 m-8 flex w-full max-w-sm flex-col items-end gap-2">
        <AnimatePresence mode="sync" />
      </div>
    </>
  );
};
