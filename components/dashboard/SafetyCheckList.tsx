'use client';

import { useEffect, useState } from 'react';
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface SafetyCheck {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
}

interface SafetyCheckResponse {
  checks: SafetyCheck[];
}

export function SafetyCheckList() {
  const [isLoading, setIsLoading] = useState(true);
  const [checks, setChecks] = useState<SafetyCheck[]>([]);

  useEffect(() => {
    const fetchChecks = async () => {
      try {
        const response = await fetch('/api/safety-checks');
        if (!response.ok) throw new Error('Failed to fetch safety checks');

        const data = (await response.json()) as SafetyCheckResponse;
        setChecks(data.checks);
      } catch (error) {
        console.error('Error fetching safety checks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchChecks();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (checks.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No safety checks
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first safety check.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {checks.map(check => (
          <li key={check.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {check.completed ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-400" />
                  )}
                  <p className="ml-2 text-sm font-medium text-gray-900">
                    {check.title}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {new Date(check.dueDate).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="text-sm text-gray-500">{check.description}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
