import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CalendarIcon, ClockIcon, LocationIcon } from '@/src/assets/icons';

interface SafetyCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SafetyCheckModal({ isOpen, onClose }: SafetyCheckModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/safety-checks/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          time,
          location,
        }),
      });

      if (!response.ok) throw new Error('Failed to schedule safety check');

      onClose();
    } catch (error) {
      console.error('Error scheduling safety check:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>

          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Schedule Safety Check
              </Dialog.Title>

              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <span>Date</span>
                    </div>
                  </label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setDate(e.target.value)
                    }
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium text-gray-700"
                  >
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                      <span>Time</span>
                    </div>
                  </label>
                  <Input
                    id="time"
                    type="time"
                    required
                    value={time}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTime(e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700"
                  >
                    <div className="flex items-center space-x-2">
                      <LocationIcon className="h-5 w-5 text-gray-400" />
                      <span>Location</span>
                    </div>
                  </label>
                  <Input
                    id="location"
                    type="text"
                    required
                    value={location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setLocation(e.target.value)
                    }
                    placeholder="Enter location"
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    {loading ? 'Scheduling...' : 'Schedule Check'}
                  </Button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
