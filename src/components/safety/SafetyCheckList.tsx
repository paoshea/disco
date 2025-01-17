import React, { useState } from 'react';
import { SafetyCheckNew } from '@/types/safety';
import { Button } from '@/components/ui/Button';
import { SafetyCheckModal } from './SafetyCheckModal';
import { formatDistanceToNow } from 'date-fns';

interface SafetyCheckListProps {
  checks: SafetyCheckNew[];
  onComplete: (checkId: string) => Promise<void>;
}

export const SafetyCheckList: React.FC<SafetyCheckListProps> = ({ checks, onComplete }) => {
  const [selectedCheck, setSelectedCheck] = useState<SafetyCheckNew | null>(null);
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

  const handleResolve = async (checkId: string, status: 'safe' | 'unsafe', notes?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      if (status === 'safe') {
        await onComplete(checkId);
      }
      setSelectedCheck(null);
    } catch (err) {
      console.error('Error resolving safety check:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while resolving the safety check. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteWrapper = (check: SafetyCheckNew) => (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedCheck(check);
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
              {check.type === 'meetup' ? 'Meetup Safety Check' : 
               check.type === 'location' ? 'Location Safety Check' : 'Custom Safety Check'}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(check.scheduledFor), { addSuffix: true })}
            </p>
            {check.description && <p className="mt-1 text-sm text-gray-600">{check.description}</p>}
          </div>
          <Button
            onClick={handleCompleteWrapper(check)}
            disabled={isLoading}
            variant="primary"
            size="sm"
          >
            Complete Check
          </Button>
        </div>
      ))}

      {selectedCheck && (
        <SafetyCheckModal
          check={selectedCheck}
          isOpen={true}
          onClose={() => setSelectedCheck(null)}
          onResolve={handleResolve}
        />
      )}
    </div>
  );
};
