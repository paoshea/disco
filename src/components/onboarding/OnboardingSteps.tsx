import React, { useState } from 'react';
import { User } from '@/types/user';

interface OnboardingStepsProps {
  onComplete: (userData: Partial<User>) => void;
}

interface OnboardingData extends Partial<User> {
  displayName: string;
  phoneNumber: string;
  bio: string;
  interests: string[];
}

export const OnboardingSteps: React.FC<OnboardingStepsProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<OnboardingData>({
    displayName: '',
    phoneNumber: '',
    bio: '',
    interests: [],
  });

  const handleNext = () => {
    if (step === 4) {
      onComplete({
        name: userData.displayName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
      });
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Welcome! Let&apos;s get started</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                What should we call you?
              </label>
              <input
                type="text"
                value={userData.displayName}
                onChange={e => setUserData({ ...userData, displayName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Contact Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={userData.phoneNumber}
                onChange={e => setUserData({ ...userData, phoneNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Tell us about yourself</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                value={userData.bio}
                onChange={e => setUserData({ ...userData, bio: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Almost done!</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select your interests
              </label>
              <div className="mt-2 space-y-2">
                {['Sports', 'Music', 'Art', 'Technology', 'Travel'].map(interest => (
                  <label key={interest} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={userData.interests.includes(interest)}
                      onChange={e => {
                        if (e.target.checked) {
                          setUserData({
                            ...userData,
                            interests: [...userData.interests, interest],
                          });
                        } else {
                          setUserData({
                            ...userData,
                            interests: userData.interests.filter(i => i !== interest),
                          });
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{interest}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3, 4].map(number => (
            <div
              key={number}
              className={`w-1/4 h-1 rounded-full ${
                number <= step ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {renderStep()}

      <div className="mt-8 flex justify-between">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          className="ml-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
        >
          {step === 4 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};
