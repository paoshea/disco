'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SafetyService } from '@/services/safety/safety.service';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@headlessui/react';

interface SafetySettings {
  enabled: boolean;
  emergencyContacts: {
    id: string;
    name: string;
    phone: string;
    email: string;
    priority: 'primary' | 'secondary';
  }[];
}

interface SafetySettingsResponse {
  enabled: boolean;
  emergencyContacts: {
    id: string;
    name: string;
    phone: string;
    email: string;
    priority: 'primary' | 'secondary';
  }[];
}

export default function SafetyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [settings, setSettings] = useState<SafetySettings>({
    enabled: false,
    emergencyContacts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) {
        router.push('/auth/signin');
        return;
      }

      try {
        const safetyService = SafetyService.getInstance();
        const contacts = await safetyService.getEmergencyContacts(user.id);

        setSettings({
          enabled: true, // TODO: Get from settings when implemented
          emergencyContacts: contacts.map(c => ({
            id: c.id,
            name: `${c.firstName} ${c.lastName}`,
            phone: c.phoneNumber || '',
            email: c.email || '',
            priority: 'primary' as const,
          })),
        });
      } catch (error) {
        console.error('Error fetching safety settings:', error);
        toast.error('Failed to fetch safety settings. Please try again later');
      } finally {
        setLoading(false);
      }
    };

    void fetchSettings();
  }, [user?.id, router]);

  const handleToggleSafety = async (enabled: boolean) => {
    if (!user?.id) return;

    try {
      const safetyService = SafetyService.getInstance();
      await safetyService.updateSafetySettings(user.id, {
        enabled,
      });
      setSettings(prev => ({ ...prev, enabled }));
      toast.success(
        enabled ? 'Safety features enabled' : 'Safety features disabled'
      );
    } catch (error) {
      console.error('Error updating safety settings:', error);
      toast.error('Failed to update safety settings. Please try again later');
    }
  };

  const handleToggleSafetySync = (enabled: boolean) => {
    void handleToggleSafety(enabled);
  };

  const handleAddContact = async (contact: {
    name: string;
    phone: string;
    email: string;
    priority: 'primary' | 'secondary';
  }) => {
    if (!user?.id) return;

    try {
      const safetyService = SafetyService.getInstance();
      const [firstName, ...lastNameParts] = contact.name.split(' ');
      const lastName = lastNameParts.join(' ');

      const newContact = await safetyService.addEmergencyContact(user.id, {
        firstName,
        lastName: lastName || firstName, // Fallback if no last name
        email: contact.email,
        phoneNumber: contact.phone,
      });

      // Refresh emergency contacts
      const contacts = await safetyService.getEmergencyContacts(user.id);
      setSettings(prev => ({
        ...prev,
        emergencyContacts: contacts.map(c => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          phone: c.phoneNumber || '',
          email: c.email || '',
          priority: 'primary' as const,
        })),
      }));

      toast.success('Emergency contact added successfully');
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      toast.error('Failed to add emergency contact. Please try again later');
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    if (!user?.id) return;

    try {
      const safetyService = SafetyService.getInstance();
      await safetyService.deleteEmergencyContact(user.id, contactId);

      // Refresh emergency contacts
      const contacts = await safetyService.getEmergencyContacts(user.id);
      setSettings(prev => ({
        ...prev,
        emergencyContacts: contacts.map(c => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          phone: c.phoneNumber || '',
          email: c.email || '',
          priority: 'primary' as const,
        })),
      }));

      toast.success('Emergency contact removed successfully');
    } catch (error) {
      console.error('Error removing emergency contact:', error);
      toast.error('Failed to remove emergency contact. Please try again later');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Safety Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Enable Safety Features</h2>
            <p className="text-gray-600">
              Activate safety monitoring and emergency contact features
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onChange={handleToggleSafetySync}
            className={`${
              settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                settings.enabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        {settings.enabled && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Emergency Contacts</h3>
            {settings.emergencyContacts.length > 0 ? (
              <ul className="space-y-4">
                {settings.emergencyContacts.map(contact => (
                  <li
                    key={contact.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                      <p className="text-sm text-gray-600">{contact.phone}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        contact.priority === 'primary'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {contact.priority}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No emergency contacts added yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
