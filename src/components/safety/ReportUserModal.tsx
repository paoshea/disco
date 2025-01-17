import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { TextArea } from '@/components/forms/TextArea';
import { SafetyReport } from '@/types/safety';
import { User } from '@/types/user';
import { safetyService } from '@/services/api/safety.service';

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  reportedUser: User;
  meetingId?: string;
}

interface ReportFormData {
  type: SafetyReport['type'];
  description: string;
}

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isOpen,
  onClose,
  user,
  reportedUser,
  meetingId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportFormData>();

  const handleReport = async (data: ReportFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const report = {
        reporterId: user.id,
        reportedUserId: reportedUser.id,
        meetingId,
        type: data.type,
        description: data.description.trim(),
        evidence: [],
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await safetyService.createSafetyReport(user.id, report);
      reset();
      onClose();
    } catch (err) {
      console.error('Error submitting report:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while submitting your report. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit(handleReport)(e);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
            Report User
          </Dialog.Title>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleFormSubmitWrapper} className="mt-4 space-y-6">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type of Report
              </label>
              <select
                id="type"
                {...register('type', { required: 'Please select a type' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a type</option>
                <option value="harassment">Harassment</option>
                <option value="inappropriate">Inappropriate Behavior</option>
                <option value="impersonation">Impersonation</option>
                <option value="scam">Scam</option>
                <option value="emergency">Emergency</option>
                <option value="safety_check">Safety Check</option>
                <option value="other">Other</option>
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
            </div>

            <TextArea<ReportFormData>
              label="Description"
              name="description"
              register={register}
              rules={{
                required: 'Please provide a description',
                minLength: {
                  value: 20,
                  message: 'Please provide more details (minimum 20 characters)',
                },
              }}
              error={errors.description?.message}
              placeholder="Please describe what happened..."
            />

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};
