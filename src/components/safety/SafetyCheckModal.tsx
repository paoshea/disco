import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/forms/TextArea';
import { useForm } from 'react-hook-form';

interface SafetyCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (checkId: string, notes?: string) => Promise<void>;
  checkId: string;
}

interface FormData {
  notes: string;
}

export const SafetyCheckModal: React.FC<SafetyCheckModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  checkId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const handleComplete = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await onComplete(checkId, data.notes);
      onClose();
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

  const handleFormSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit(handleComplete)(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Safety Check"
      size="md"
    >
      <form onSubmit={handleFormSubmitWrapper} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500 mb-4">
            Please confirm that you&apos;re safe and add any additional notes if needed.
          </p>

          <TextArea<FormData>
            label="Notes (Optional)"
            name="notes"
            register={register}
            error={errors.notes?.message}
            placeholder="Add any additional information about your safety status..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
          >
            {isLoading ? 'Confirming...' : 'Confirm Safety'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
