import React from 'react';
import { EmergencyContact } from '@/types/user';
import { Button } from '@/components/ui/Button';

interface EmergencyContactListProps {
  contacts: EmergencyContact[];
  onEdit: (contact: EmergencyContact) => void;
  onDelete: (id: string) => void;
}

export const EmergencyContactList: React.FC<EmergencyContactListProps> = ({
  contacts,
  onEdit,
  onDelete,
}) => {
  const getNotificationText = (
    notifyOn: EmergencyContact['notifyOn']
  ): string => {
    const notifications = [];
    if (notifyOn.sosAlert) notifications.push('SOS Alerts');
    if (notifyOn.meetupStart) notifications.push('Meetup Start');
    if (notifyOn.meetupEnd) notifications.push('Meetup End');
    return notifications.join(', ');
  };

  return (
    <div className="space-y-4">
      {contacts.map(contact => (
        <div
          key={contact.id}
          className="bg-white shadow rounded-lg p-4 flex justify-between items-start"
        >
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {contact.name}
            </h3>
            <div className="mt-1 text-sm text-gray-500">
              <p>{contact.phoneNumber}</p>
              <p>{contact.email}</p>
              <p>{contact.relationship}</p>
              <p className="mt-1">
                Notified on: {getNotificationText(contact.notifyOn)}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={() => onEdit(contact)}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => onDelete(contact.id)}>
              Delete
            </Button>
          </div>
        </div>
      ))}
      {contacts.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          No emergency contacts added yet.
        </p>
      )}
    </div>
  );
};
