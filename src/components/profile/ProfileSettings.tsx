import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Switch } from '@headlessui/react';
import { userService } from '@/services/api/user.service';

interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  darkMode: boolean;
  twoFactorEnabled: boolean;
  locationSharing: boolean;
  profileVisibility: 'public' | 'private' | 'friends';
}

export const ProfileSettings: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setValue } = useForm<UserSettings>();
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: false,
    pushNotifications: false,
    smsNotifications: false,
    darkMode: false,
    twoFactorEnabled: false,
    locationSharing: false,
    profileVisibility: 'private'
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await userService.getSettings();
        setSettings(userSettings);
        
        // Update form values
        Object.entries(userSettings).forEach(([key, value]) => {
          setValue(key as keyof UserSettings, value);
        });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    void loadSettings();
  }, [setValue]);

  const handleSettingChange = (setting: keyof UserSettings, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    setValue(setting, value);
  };

  const handleFormSubmit = async (data: UserSettings) => {
    try {
      setIsSubmitting(true);
      await userService.updateSettings(data);
      setSettings(data);
    } catch (error) {
      console.error('Error updating settings:', error);
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
      <div className="space-y-4">
        <Switch.Group>
          <div className="flex items-center justify-between">
            <Switch.Label className="text-sm font-medium text-gray-700">
              Email Notifications
            </Switch.Label>
            <Switch
              checked={settings.emailNotifications}
              onChange={(checked) => handleSettingChange('emailNotifications', checked)}
              className={`${
                settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </Switch.Group>

        <Switch.Group>
          <div className="flex items-center justify-between">
            <Switch.Label className="text-sm font-medium text-gray-700">
              Push Notifications
            </Switch.Label>
            <Switch
              checked={settings.pushNotifications}
              onChange={(checked) => handleSettingChange('pushNotifications', checked)}
              className={`${
                settings.pushNotifications ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </Switch.Group>

        <Switch.Group>
          <div className="flex items-center justify-between">
            <Switch.Label className="text-sm font-medium text-gray-700">
              SMS Notifications
            </Switch.Label>
            <Switch
              checked={settings.smsNotifications}
              onChange={(checked) => handleSettingChange('smsNotifications', checked)}
              className={`${
                settings.smsNotifications ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </Switch.Group>

        <Switch.Group>
          <div className="flex items-center justify-between">
            <Switch.Label className="text-sm font-medium text-gray-700">
              Dark Mode
            </Switch.Label>
            <Switch
              checked={settings.darkMode}
              onChange={(checked) => handleSettingChange('darkMode', checked)}
              className={`${
                settings.darkMode ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </Switch.Group>

        <Switch.Group>
          <div className="flex items-center justify-between">
            <Switch.Label className="text-sm font-medium text-gray-700">
              Two-Factor Authentication
            </Switch.Label>
            <Switch
              checked={settings.twoFactorEnabled}
              onChange={(checked) => handleSettingChange('twoFactorEnabled', checked)}
              className={`${
                settings.twoFactorEnabled ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </Switch.Group>

        <Switch.Group>
          <div className="flex items-center justify-between">
            <Switch.Label className="text-sm font-medium text-gray-700">
              Location Sharing
            </Switch.Label>
            <Switch
              checked={settings.locationSharing}
              onChange={(checked) => handleSettingChange('locationSharing', checked)}
              className={`${
                settings.locationSharing ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.locationSharing ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </Switch.Group>

        <div className="space-y-1">
          <label htmlFor="profileVisibility" className="text-sm font-medium text-gray-700">
            Profile Visibility
          </label>
          <select
            id="profileVisibility"
            value={settings.profileVisibility}
            onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="friends">Friends Only</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};
