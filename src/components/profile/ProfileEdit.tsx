import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';

interface ProfileEditProps {
  user: User;
  onUpdate: (data: Partial<User>) => Promise<void>;
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

export const ProfileEdit: React.FC<ProfileEditProps> = ({ user, onUpdate }) => {
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
      interests: user.interests || [],
      phoneNumber: user.phoneNumber || '',
    },
  });

  const selectedInterests = watch('interests');

  const toggleInterest = (interest: string) => {
    const current = selectedInterests || [];
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest];
    setValue('interests', updated);
  };

  const handleFormSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      await onUpdate(data);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
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
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Input
            label="First Name"
            {...register('firstName', { required: 'First name is required' })}
            error={errors.firstName?.message}
          />
        </div>

        <div>
          <Input
            label="Last Name"
            {...register('lastName', { required: 'Last name is required' })}
            error={errors.lastName?.message}
          />
        </div>
      </div>

      <div>
        <Input
          label="Phone Number"
          type="tel"
          {...register('phoneNumber')}
          error={errors.phoneNumber?.message}
        />
      </div>

      <div>
        <TextArea
          label="Bio"
          {...register('bio')}
          error={errors.bio?.message}
          rows={4}
          placeholder="Tell us about yourself..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Interests</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {AVAILABLE_INTERESTS.map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                selectedInterests?.includes(interest)
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-800'
              } hover:bg-primary-200`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="submit" variant="primary" loading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};
