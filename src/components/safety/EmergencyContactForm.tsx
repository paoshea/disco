import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EmergencyContact } from '@/types/safety';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

interface EmergencyContactFormProps {
  onSubmit: (data: Partial<EmergencyContact>) => Promise<void>;
  onCancel: () => void;
  initialData?: EmergencyContact;
}

export const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<EmergencyContact>({
    defaultValues: initialData
  });

  const notificationTypes = [
    { id: 'sos', label: 'SOS Alerts' },
    { id: 'meetup', label: 'Meetup Updates' },
    { id: 'location', label: 'Location Sharing' }
  ];

  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    initialData?.notifyOn || []
  );

  const handleNotificationChange = (type: string, checked: boolean) => {
    setSelectedTypes(prev => 
      checked ? [...prev, type] : prev.filter(t => t !== type)
    );
  };

  const handleFormSubmit = async (data: EmergencyContact) => {
    await onSubmit({
      ...data,
      notifyOn: selectedTypes
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Name"
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })}
      />

      <Input
        label="Phone"
        error={errors.phone?.message}
        {...register('phone', { required: 'Phone number is required' })}
      />

      <Input
        label="Email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Relation"
        error={errors.relation?.message}
        {...register('relation')}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Notify For
        </label>
        <div className="space-y-2">
          {notificationTypes.map(type => (
            <Checkbox
              key={type.id}
              label={type.label}
              checked={selectedTypes.includes(type.id)}
              onChange={(e) => handleNotificationChange(type.id, e.target.checked)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Add'} Contact
        </Button>
      </div>
    </form>
  );
};
