import React from 'react';
import { useForm } from 'react-hook-form';
import { EmergencyContact } from '@/types/user';

interface EmergencyContactFormProps {
  initialData?: Partial<EmergencyContact>;
  onSubmit: (data: Partial<EmergencyContact>) => void;
  onCancel: () => void;
}

export const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmergencyContact>({
    defaultValues: {
      name: initialData?.name || '',
      relationship: initialData?.relationship || '',
      phoneNumber: initialData?.phoneNumber || '',
      email: initialData?.email || '',
      notifyOn: initialData?.notifyOn || {
        sosAlert: true,
        meetupStart: true,
        meetupEnd: true,
      },
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          {...register('phoneNumber', {
            required: 'Phone number is required',
            pattern: {
              value: /^\+?[\d\s-]+$/,
              message: 'Invalid phone number',
            },
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Relationship</label>
        <input
          type="text"
          {...register('relationship', { required: 'Relationship is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.relationship && (
          <p className="mt-1 text-sm text-red-600">{errors.relationship.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          {...register('email', {
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notify On</label>
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
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Contact
        </button>
      </div>
    </form>
  );
};
