import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { SafetyCheck } from '@/types/safety';
import { safetyService } from '@/services/api/safety.service';

interface SafetyCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  userId: string;
}

export const SafetyCheckModal: React.FC<SafetyCheckModalProps> = ({
  isOpen,
  onClose,
  meetingId,
  userId,
}) => {
  const [response, setResponse] = useState<'safe' | 'unsafe'>();
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSubmit = async () => {
    if (!response) return;

    try {
      await safetyService.submitSafetyCheck({
        meetingId,
        userId,
        response,
        notes,
        status: 'completed',
        scheduledTime: selectedDate.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (response === 'unsafe') {
        const location = await getCurrentLocation();
        await safetyService.triggerEmergencyAlert({
          userId,
          type: 'safety_check',
          location: location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy || 0,
              }
            : undefined,
          status: 'active',
          message: `User reported unsafe during safety check for meeting ${meetingId}`,
          createdAt: new Date().toISOString(),
        });
      }

      onClose();
    } catch (error) {
      console.error('Failed to submit safety check:', error);
    }
  };

  const getCurrentLocation = async () => {
    return new Promise<{ latitude: number; longitude: number; accuracy: number }>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          position => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
          },
          error => {
            reject(error);
          }
        );
      }
    );
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
            Safety Check
          </Dialog.Title>

          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Please confirm your safety status. Your response will be kept confidential.
            </p>

            <div className="mt-4 space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setResponse('safe')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    response === 'safe'
                      ? 'bg-green-500 text-white border-transparent'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  I'm Safe
                </button>
                <button
                  onClick={() => setResponse('unsafe')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    response === 'unsafe'
                      ? 'bg-red-500 text-white border-transparent'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Need Help
                </button>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Add any relevant details..."
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!response}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
