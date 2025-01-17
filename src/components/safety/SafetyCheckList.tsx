import React from 'react';
import { SafetyCheck } from '@/types/safety';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';

interface SafetyCheckListProps {
  checks: SafetyCheck[];
  onResolve: (checkId: string) => Promise<void>;
}

export const SafetyCheckList: React.FC<SafetyCheckListProps> = ({ checks, onResolve }) => {
  const [resolvingId, setResolvingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleResolve = async (checkId: string) => {
    try {
      setResolvingId(checkId);
      setError(null);
      await onResolve(checkId);
    } catch (err) {
      setError('Failed to resolve safety check. Please try again.');
      console.error('Error resolving safety check:', err);
    } finally {
      setResolvingId(null);
    }
  };

  if (checks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No safety checks at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <ul className="divide-y divide-gray-200">
        {checks.map((check) => (
          <li key={check.id} className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {check.type === 'meetup' ? 'Meetup Safety Check' : 'Regular Safety Check'}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(check.scheduledFor, { addSuffix: true })}
                </p>
                {check.notes && (
                  <p className="mt-1 text-sm text-gray-600">{check.notes}</p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                {check.status === 'pending' ? (
                  <Button
                    onClick={() => handleResolve(check.id)}
                    disabled={resolvingId === check.id}
                    loading={resolvingId === check.id}
                    size="sm"
                  >
                    I'm Safe
                  </Button>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Resolved
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
