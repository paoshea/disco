import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
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

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isOpen,
  onClose,
  user,
  reportedUser,
  meetingId,
}) => {
  const [type, setType] = useState<SafetyReport['type']>('harassment');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const report = {
        reporterId: user.id,
        reportedUserId: reportedUser.id,
        meetingId,
        type,
        description: description.trim(),
        evidence: [],
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await safetyService.createSafetyReport(user.id, report);
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
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

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Type of Report</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as SafetyReport['type'])}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="harassment">Harassment</option>
                <option value="inappropriate">Inappropriate Behavior</option>
                <option value="impersonation">Impersonation</option>
                <option value="scam">Scam</option>
                <option value="emergency">Emergency</option>
                <option value="safety_check">Safety Check</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
                required
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
