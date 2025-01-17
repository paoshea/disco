import React, { useState } from 'react';
import { User, EmergencyContact } from '@/types/user';

interface OnboardingStepsProps {
  currentStep: number;
  onComplete: (userData: Partial<User>) => Promise<void>;
}

export const OnboardingSteps: React.FC<OnboardingStepsProps> = ({
  currentStep,
  onComplete,
}) => {
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    bio: '',
    interests: [],
    emergencyContacts: [],
  });

  const [currentEmergencyContact, setCurrentEmergencyContact] = useState<EmergencyContact>({
    id: crypto.randomUUID(),
    name: '',
    relationship: '',
    phoneNumber: '',
    email: '',
    notifyOn: {
      sosAlert: true,
      meetupStart: false,
      meetupEnd: false,
    },
  });

  const handleNext = async () => {
    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Failed to complete onboarding step:', error);
    }
  };

  const addEmergencyContact = () => {
    if (currentEmergencyContact.name && currentEmergencyContact.phoneNumber) {
      setFormData((prev) => ({
        ...prev,
        emergencyContacts: [
          ...(prev.emergencyContacts || []),
          { ...currentEmergencyContact },
        ],
      }));
      setCurrentEmergencyContact({
        id: crypto.randomUUID(),
        name: '',
        relationship: '',
        phoneNumber: '',
        email: '',
        notifyOn: {
          sosAlert: true,
          meetupStart: false,
          meetupEnd: false,
        },
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">About You</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Interests</label>
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  placeholder="Add interests (press Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      setFormData({
                        ...formData,
                        interests: [...(formData.interests || []), e.currentTarget.value],
                      });
                      e.currentTarget.value = '';
                    }
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <div className="flex flex-wrap gap-2">
                  {formData.interests?.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            interests: formData.interests?.filter((_, i) => i !== index),
                          })
                        }
                        className="ml-2 inline-flex items-center p-0.5 rounded-full text-primary-400 hover:bg-primary-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Emergency Contacts</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={currentEmergencyContact.name}
                    onChange={(e) =>
                      setCurrentEmergencyContact({ ...currentEmergencyContact, name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Relationship</label>
                  <input
                    type="text"
                    value={currentEmergencyContact.relationship}
                    onChange={(e) =>
                      setCurrentEmergencyContact({
                        ...currentEmergencyContact,
                        relationship: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={currentEmergencyContact.phoneNumber}
                    onChange={(e) =>
                      setCurrentEmergencyContact({
                        ...currentEmergencyContact,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={currentEmergencyContact.email}
                    onChange={(e) =>
                      setCurrentEmergencyContact({
                        ...currentEmergencyContact,
                        email: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Notify On</h3>
                <div className="space-y-2">
                  {Object.entries(currentEmergencyContact.notifyOn).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`notify-${key}`}
                        checked={value}
                        onChange={(e) =>
                          setCurrentEmergencyContact({
                            ...currentEmergencyContact,
                            notifyOn: {
                              ...currentEmergencyContact.notifyOn,
                              [key]: e.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`notify-${key}`}
                        className="ml-2 block text-sm text-gray-700"
                      >
                        {key.split(/(?=[A-Z])/).join(' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={addEmergencyContact}
                className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Add Contact
              </button>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Added Contacts</h3>
              <div className="space-y-4">
                {formData.emergencyContacts?.map((contact, index) => (
                  <div
                    key={contact.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{contact.name}</h4>
                        <p className="text-sm text-gray-500">{contact.relationship}</p>
                        <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            emergencyContacts: formData.emergencyContacts?.filter(
                              (_, i) => i !== index
                            ),
                          })
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === currentStep
                    ? 'bg-primary-600 text-white'
                    : step < currentStep
                    ? 'bg-primary-200 text-primary-700'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-500">Step {currentStep} of 3</div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {renderStep()}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {currentStep === 3 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
