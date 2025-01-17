import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { SafetyReport } from '@/types/safety';
import { safetyService } from '@/services/api/safety.service';

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string;
  meetingId?: string;
}

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isOpen,
  onClose,
  reportedUserId,
  meetingId,
}) => {
  const [reportType, setReportType] = useState<SafetyReport['type']>('inappropriate');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await safetyService.submitReport({
        reportedId: reportedUserId,
        meetingId,
        type: reportType,
        description,
        evidence: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      onClose();
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
            Report User
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as SafetyReport['type'])}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="inappropriate">Inappropriate Content/Behavior</option>
                  <option value="harassment">Harassment</option>
                  <option value="safety">Safety Concern</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Please provide details about your report..."
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Report
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
