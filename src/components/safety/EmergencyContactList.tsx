import React, { useState } from 'react';
import { EmergencyContact } from '@/types/safety';
import { toUserContact, toSafetyContact } from '@/utils/contactTypes';
import { Button } from '@/components/ui/Button';
import { safetyService } from '@/services/safety';

interface EmergencyContactListProps {
  contacts: EmergencyContact[];
  onEdit: (contact: EmergencyContact) => void;
  onDelete: (contactId: string) => Promise<void>;
}

export const EmergencyContactList: React.FC<EmergencyContactListProps> = ({
  contacts,
  onEdit,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (contactId: string) => {
    try {
      setIsDeleting(contactId);
      await onDelete(contactId);
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
        >
          <div>
            <h3 className="font-medium">{contact.name}</h3>
            <p className="text-sm text-gray-600">{contact.phone}</p>
            {contact.email && (
              <p className="text-sm text-gray-600">{contact.email}</p>
            )}
            {contact.relation && (
              <p className="text-sm text-gray-500">({contact.relation})</p>
            )}
            <div className="mt-1">
              <p className="text-xs text-gray-500">
                Notified for: {contact.notifyOn.join(', ')}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => onEdit(contact)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDelete(contact.id)}
              loading={isDeleting === contact.id}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
