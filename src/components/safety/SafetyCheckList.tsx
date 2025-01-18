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

  const handleCompleteCheck = async (
    checkId: string,
    status: 'safe' | 'unsafe',
    notes?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      await onComplete(checkId);
      setSelectedCheck(null);
    } catch (err) {
      console.error('Error completing safety check:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete safety check');
    } finally {
      setIsLoading(false);
    }
  };

  if (!checks.length) {
    return (
      <div className="text-center py-4 text-gray-500">No safety checks required at this time.</div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <div className="text-sm text-red-600">{error}</div>}

      {checks.map(check => (
        <div
          key={check.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
        >
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{check.type}</h3>
            <p className="text-sm text-gray-500">
              Created {formatDistanceToNow(new Date(check.createdAt))} ago
            </p>
          </div>
          <Button onClick={() => setSelectedCheck(check)} disabled={isLoading} variant="secondary">
            View Details
          </Button>
        </div>
      ))}

      {selectedCheck && (
        <SafetyCheckModal
          check={selectedCheck}
          isOpen={true}
          onClose={() => setSelectedCheck(null)}
          onResolve={async (checkId, status, notes) => {
            await onComplete(checkId);
            setSelectedCheck(null);
          }}
        />
      )}
    </div>
  );
};
