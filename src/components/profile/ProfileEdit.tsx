import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User } from '@/types/user';
import { userService } from '@/services/api/user.service';

interface ProfileEditProps {
  user: User;
  onUpdate: (user: User) => void;
  onCancel: () => void;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
  interests: string[];
  phoneNumber?: string;
}

const AVAILABLE_INTERESTS = [
  'Sports',
  'Music',
  'Art',
  'Technology',
  'Travel',
  'Food',
  'Reading',
  'Movies',
  'Gaming',
  'Fitness',
];

export const ProfileEdit: React.FC<ProfileEditProps> = ({ user, onUpdate, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio || '',
      interests: user.interests,
      phoneNumber: user.phoneNumber || '',
    },
  });

  const selectedInterests = watch('interests', []);

  const toggleInterest = (interest: string) => {
    const current = new Set(selectedInterests);
    if (current.has(interest)) {
      current.delete(interest);
    } else {
      current.add(interest);
    }
    setValue('interests', Array.from(current));
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedUser = await userService.updateProfile({
        ...user,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        interests: data.interests,
        phoneNumber: data.phoneNumber,
        name: `${data.firstName} ${data.lastName}`,
      });
      onUpdate(updatedUser);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            {...register('firstName', { required: 'First name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            disabled={isSubmitting}
          />
          {errors.firstName?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            {...register('lastName', { required: 'Last name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            disabled={isSubmitting}
          />
          {errors.lastName?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          {...register('phoneNumber')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          {...register('bio')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Interests</label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {AVAILABLE_INTERESTS.map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                selectedInterests.includes(interest)
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-800'
              } hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
              disabled={isSubmitting}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};
