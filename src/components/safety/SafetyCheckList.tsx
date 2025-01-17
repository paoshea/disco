import React, { useState } from 'react';
import { SafetyCheck } from '@/types/safety';
import { Button } from '@/components/ui/Button';
import { SafetyCheckModal } from './SafetyCheckModal';
import { formatDistanceToNow } from 'date-fns';

interface SafetyCheckListProps {
  checks: SafetyCheck[];
  onComplete: (checkId: string) => Promise<void>;
}

export const SafetyCheckList: React.FC<SafetyCheckListProps> = ({ checks, onComplete }) => {
  const [selectedCheck, setSelectedCheck] = useState<SafetyCheck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (checkId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await onComplete(checkId);
      setSelectedCheck(null);
    } catch (err) {
      console.error('Error completing safety check:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while completing the safety check. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteWrapper = (checkId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    void handleComplete(checkId);
  };

  if (!checks.length) {
    return (
      <div className="text-center py-4 text-gray-500">No safety checks required at this time.</div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {checks.map(check => (
        <div
          key={check.id}
          className="bg-white shadow rounded-lg p-4 flex items-center justify-between"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {check.type === 'meetup' ? 'Meetup Safety Check' : 'Regular Safety Check'}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(check.scheduledFor, { addSuffix: true })}
            </p>
            {check.notes && <p className="mt-1 text-sm text-gray-600">{check.notes}</p>}
          </div>
          <Button
            onClick={handleCompleteWrapper(check.id)}
            disabled={isLoading}
            variant="primary"
            size="sm"
          >
            {isLoading ? 'Completing...' : 'Complete'}
          </Button>
        </div>
      ))}
    </div>
  );
};
