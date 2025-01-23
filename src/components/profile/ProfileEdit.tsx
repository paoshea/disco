import React, { useState } from 'react';
import { User, UserPreferences } from '@/types/user';
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
  email: string;
  bio: string;
  interests: string[];
  phoneNumber?: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  maxDistance: 50,
  ageRange: { min: 18, max: 100 },
  activityTypes: [],
  gender: [],
  lookingFor: [],
  relationshipType: [],
  availability: [],
  verifiedOnly: false,
  withPhoto: true,
  interests: [],
  bio: '',
  notifications: {
    push: true,
    email: true,
    inApp: true,
    matches: true,
    messages: true,
    events: true,
    safety: true,
  },
  privacy: {
    location: 'standard',
    profile: 'public',
  },
  safety: {
    blockedUsers: [],
    reportedUsers: [],
  },
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

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
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user.preferences?.interests || []
  );

  const toggleInterest = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];

    setSelectedInterests(newInterests);
    onUpdate({ preferences: { ...user.preferences, interests: newInterests } });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const email = formData.get('email') as string;
      const phoneNumber = formData.get('phoneNumber') as string;
      const bio = formData.get('bio') as string;

      // Validate required fields
      const errors: string[] = [];
      if (!firstName.trim()) errors.push('First name is required');
      if (!lastName.trim()) errors.push('Last name is required');
      if (!email.trim()) errors.push('Email is required');

      if (errors.length > 0) {
        setError(errors.join(', '));
        setIsSubmitting(false);
        return;
      }

      // Validate email format
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Invalid email address');
        setIsSubmitting(false);
        return;
      }

      // Validate phone number format (if provided)
      if (phoneNumber && !/^\+?[\d-]{10,}$/.test(phoneNumber)) {
        setError('Invalid phone number');
        setIsSubmitting(false);
        return;
      }

      // Only send changed fields
      const updates: Partial<User> = {};

      if (firstName !== user.firstName) updates.firstName = firstName;
      if (lastName !== user.lastName) updates.lastName = lastName;
      if (email !== user.email) updates.email = email;
      if (phoneNumber !== user.phoneNumber) updates.phoneNumber = phoneNumber;
      if (bio !== user.preferences?.bio) updates.preferences = { ...user.preferences, bio };

      await onUpdate(updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div role="alert" className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={user.firstName}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="lastName"
              className="text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={user.lastName}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user.email}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="phoneNumber"
            className="text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            defaultValue={user.phoneNumber}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <div className="flex flex-col gap-1">
          <label htmlFor="bio" className="text-sm font-medium text-gray-700">
            Bio
          </label>
          <TextArea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={user.preferences?.bio}
            placeholder="Tell us about yourself..."
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[100px] resize-y"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Interests
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {AVAILABLE_INTERESTS.map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                selectedInterests.includes(interest)
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
        <Button
          type="submit"
          disabled={isSubmitting}
          className={isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
          aria-disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
