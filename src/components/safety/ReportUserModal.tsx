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
      await safetyService.createSafetyReport({
        reporterId: user.id,
        reportedId: reportedUser.id,
        meetingId,
        type,
        description,
        evidence: [],
        status: 'pending'
      });
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
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
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <Dialog.Title
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900"
          >
            Report User
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Type of Report
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SafetyReport['type'])}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="harassment">Harassment</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="emergency">Emergency</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Please provide details about the incident..."
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};
