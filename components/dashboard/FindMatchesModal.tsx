import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface FindMatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FindMatchesModal({ isOpen, onClose }: FindMatchesModalProps) {
  const [interests, setInterests] = useState('');
  const [location, setLocation] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/matches/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interests: interests.split(',').map(i => i.trim()),
          location,
          ageRange,
        }),
      });

      if (!response.ok) throw new Error('Failed to find matches');

      onClose();
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
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

          {/* This element is to trick the browser into centering the modal contents. */}
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
                Find New Matches
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                    Interests
                  </label>
                  <Input
                    id="interests"
                    type="text"
                    required
                    value={interests}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterests(e.target.value)}
                    placeholder="e.g. hiking, reading, music (comma-separated)"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Preferred Location
                  </label>
                  <Input
                    id="location"
                    type="text"
                    required
                    value={location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
                    placeholder="Enter city or area"
                  />
                </div>

                <div>
                  <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700">
                    Age Range
                  </label>
                  <Input
                    id="ageRange"
                    type="text"
                    required
                    value={ageRange}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgeRange(e.target.value)}
                    placeholder="e.g. 25-35"
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
                    className="bg-sky-600 hover:bg-sky-700 text-white"
                    disabled={loading}
                  >
                    {loading ? 'Finding Matches...' : 'Find Matches'}
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
