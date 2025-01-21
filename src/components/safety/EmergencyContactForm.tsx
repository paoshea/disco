import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField } from '@/components/forms/TextField';
import { emergencyService } from '@/services/api/emergency.service';
import type { EmergencyContactFormData } from '@/types/safety';

interface EmergencyContactFormProps {
  onSubmit: (data: EmergencyContactFormData) => void;
  onCancel: () => void;
  initialData?: Partial<EmergencyContactFormData>;
}

export const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmergencyContactFormData>({
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      phoneNumber: initialData?.phoneNumber || '',
      email: initialData?.email || '',
      notifyOn: initialData?.notifyOn || {
        sosAlert: true,
        meetupStart: true,
        meetupEnd: true,
        lowBattery: true,
        enterPrivacyZone: true,
        exitPrivacyZone: true,
      },
    },
  });

  const handleFormSubmit = async (data: EmergencyContactFormData) => {
    try {
      setIsSubmitting(true);
      await emergencyService.addEmergencyContact(data);
      onSubmit(data);
    } catch (error) {
      console.error('Error saving emergency contact:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit(handleFormSubmit)(e);
  };

  return (
    <form onSubmit={handleFormSubmitWrapper} className="space-y-6">
      <TextField<EmergencyContactFormData>
        label="First Name"
        name="firstName"
        register={register}
        rules={{ required: 'First name is required' }}
        error={errors.firstName?.message}
      />

      <TextField<EmergencyContactFormData>
        label="Last Name"
        name="lastName"
        register={register}
        rules={{ required: 'Last name is required' }}
        error={errors.lastName?.message}
      />

      <TextField<EmergencyContactFormData>
        label="Phone Number"
        name="phoneNumber"
        type="tel"
        register={register}
        rules={{
          required: 'Phone number is required',
          pattern: {
            value: /^\+?[\d\s-()]+$/,
            message: 'Please enter a valid phone number',
          },
        }}
        error={errors.phoneNumber?.message}
      />

      <TextField<EmergencyContactFormData>
        label="Email"
        name="email"
        type="email"
        register={register}
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Please enter a valid email address',
          },
        }}
        error={errors.email?.message}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Notify On
        </label>
        <div className="mt-2 space-y-2">
          <div>
            <input
              type="checkbox"
              {...register('notifyOn.sosAlert')}
              id="sosAlert"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="sosAlert" className="ml-2 text-sm text-gray-700">
              SOS Alerts
            </label>
          </div>
          <div>
            <input
              type="checkbox"
              {...register('notifyOn.meetupStart')}
              id="meetupStart"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="meetupStart" className="ml-2 text-sm text-gray-700">
              Meetup Start
            </label>
          </div>
          <div>
            <input
              type="checkbox"
              {...register('notifyOn.meetupEnd')}
              id="meetupEnd"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="meetupEnd" className="ml-2 text-sm text-gray-700">
              Meetup End
            </label>
          </div>
          <div>
            <input
              type="checkbox"
              {...register('notifyOn.lowBattery')}
              id="lowBattery"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="lowBattery" className="ml-2 text-sm text-gray-700">
              Low Battery
            </label>
          </div>
          <div>
            <input
              type="checkbox"
              {...register('notifyOn.enterPrivacyZone')}
              id="enterPrivacyZone"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="enterPrivacyZone"
              className="ml-2 text-sm text-gray-700"
            >
              Enter Privacy Zone
            </label>
          </div>
          <div>
            <input
              type="checkbox"
              {...register('notifyOn.exitPrivacyZone')}
              id="exitPrivacyZone"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="exitPrivacyZone"
              className="ml-2 text-sm text-gray-700"
            >
              Exit Privacy Zone
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Contact'}
        </button>
      </div>
    </form>
  );
};
