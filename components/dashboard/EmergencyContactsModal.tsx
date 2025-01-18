import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ContactsIcon } from '@/src/assets/icons';

interface Contact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyContactsModal({
  isOpen,
  onClose,
}: EmergencyContactsModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([
    { name: '', relationship: '', phone: '', email: '' },
  ]);

  const handleAddContact = () => {
    setContacts([
      ...contacts,
      { name: '', relationship: '', phone: '', email: '' },
    ]);
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleContactChange = (
    index: number,
    field: keyof Contact,
    value: string
  ) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/emergency-contacts/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts }),
      });

      if (!response.ok) throw new Error('Failed to update emergency contacts');

      onClose();
    } catch (error) {
      console.error('Error updating emergency contacts:', error);
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
            <Dialog.Panel className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center space-x-2 mb-4">
                <ContactsIcon className="h-6 w-6 text-green-500" />
                <Dialog.Title className="text-lg font-medium text-gray-900">
                  Update Emergency Contacts
                </Dialog.Title>
              </div>

              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
                {contacts.map((contact, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-700">
                        Contact {index + 1}
                      </h4>
                      {contacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveContact(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <Input
                          type="text"
                          required
                          value={contact.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleContactChange(index, 'name', e.target.value)
                          }
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Relationship
                        </label>
                        <Input
                          type="text"
                          required
                          value={contact.relationship}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleContactChange(
                              index,
                              'relationship',
                              e.target.value
                            )
                          }
                          placeholder="e.g. Parent, Sibling, Friend"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <Input
                          type="tel"
                          required
                          value={contact.phone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleContactChange(index, 'phone', e.target.value)
                          }
                          placeholder="Phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <Input
                          type="email"
                          required
                          value={contact.email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleContactChange(index, 'email', e.target.value)
                          }
                          placeholder="Email address"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={handleAddContact}
                  className="w-full bg-gray-50 text-gray-600 hover:bg-gray-100"
                >
                  Add Another Contact
                </Button>

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
                  >
                    Save Changes
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
