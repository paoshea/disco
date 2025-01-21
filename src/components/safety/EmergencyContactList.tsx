import React from 'react';
import { EmergencyContact } from '@/types/safety';

interface EmergencyContactListProps {
  contacts: EmergencyContact[];
  onEdit: (contact: EmergencyContact) => void;
  onDelete: (contactId: string) => void;
}

export const EmergencyContactList: React.FC<EmergencyContactListProps> = ({
  contacts,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-4">
      {contacts.map(contact => (
        <div
          key={contact.id}
          className="bg-white shadow rounded-lg p-4 flex justify-between items-start"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-gray-900">
              {contact.firstName} {contact.lastName}
            </h3>
            <p className="text-sm text-gray-500">
              {contact.phoneNumber && (
                <span className="block">📱 {contact.phoneNumber}</span>
              )}
              {contact.email && (
                <span className="block">✉️ {contact.email}</span>
              )}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(contact)}
              className="text-primary-600 hover:text-primary-800"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(contact.id)}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
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
