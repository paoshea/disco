import React, { useState } from 'react';
import type { SafetyCheckModalProps } from '@/types/safety';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/forms/TextArea';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export const SafetyCheckModal: React.FC<SafetyCheckModalProps> = ({
  check,
  isOpen,
  onClose,
  onResolve,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = async (status: 'safe' | 'unsafe'): Promise<void> => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onResolve(check.id, status, notes);
      onClose();
    } catch (err) {
      console.error('Error resolving safety check:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while resolving the safety check'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Safety Check Required
          </Dialog.Title>

          <div className="mt-4">
            <p className="text-sm text-gray-500">{check.description}</p>

            {error && <ErrorMessage message={error} className="mt-4" />}

            <TextArea
              label="Additional Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any relevant details about your safety status..."
              className="mt-4"
              rows={3}
            />

            <div className="mt-6 flex justify-end space-x-4">
              <Button
                type="button"
                variant="danger"
                onClick={() => handleResolve('unsafe')}
                disabled={isSubmitting}
              >
                Report Unsafe
              </Button>
              <Button
                type="button"
                variant="success"
                onClick={() => handleResolve('safe')}
                disabled={isSubmitting}
              >
                Confirm Safe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
