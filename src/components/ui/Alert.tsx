import React from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title: string;
  message: string;
  className?: string;
  onClose?: () => void;
}

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const styles = {
  success: {
    container: 'bg-green-50',
    icon: 'text-green-400',
    title: 'text-green-800',
    message: 'text-green-700',
    button: 'bg-green-50 text-green-500 hover:bg-green-100',
  },
  error: {
    container: 'bg-red-50',
    icon: 'text-red-400',
    title: 'text-red-800',
    message: 'text-red-700',
    button: 'bg-red-50 text-red-500 hover:bg-red-100',
  },
  warning: {
    container: 'bg-yellow-50',
    icon: 'text-yellow-400',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
    button: 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100',
  },
  info: {
    container: 'bg-blue-50',
    icon: 'text-blue-400',
    title: 'text-blue-800',
    message: 'text-blue-700',
    button: 'bg-blue-50 text-blue-500 hover:bg-blue-100',
  },
};

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  className,
  onClose,
}) => {
  const Icon = icons[type];
  const style = styles[type];

  return (
    <div className={clsx('rounded-md p-4', style.container, className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={clsx('h-5 w-5', style.icon)} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={clsx('text-sm font-medium', style.title)}>{title}</h3>
          <div className={clsx('mt-2 text-sm', style.message)}>
            <p>{message}</p>
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={clsx(
                  'inline-flex rounded-md p-1.5',
                  style.button,
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  {
                    'focus:ring-green-600 focus:ring-offset-green-50':
                      type === 'success',
                    'focus:ring-red-600 focus:ring-offset-red-50':
                      type === 'error',
                    'focus:ring-yellow-600 focus:ring-offset-yellow-50':
                      type === 'warning',
                    'focus:ring-blue-600 focus:ring-offset-blue-50':
                      type === 'info',
                  }
                )}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
