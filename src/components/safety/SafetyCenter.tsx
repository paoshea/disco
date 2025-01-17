import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { safetyService } from '@/services/api/safety.service';
import { SafetySettings, EmergencyContact, VerificationStatus } from '@/types/safety';
import { EmergencyContactList } from './EmergencyContactList';
import { EmergencyContactForm } from './EmergencyContactForm';
import { SafetyFeatures } from './SafetyFeatures';
import { SafetyCheckModal } from './SafetyCheckModal';

export const SafetyCenter: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SafetySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  const fetchSafetySettings = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await safetyService.getSettings(user.id);
      setSettings(data);
      setError(null);
    } catch (err) {
      setError('Failed to load safety settings');
      console.error('Error fetching safety settings:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSafetySettings();
  }, [fetchSafetySettings]);

  const handleUpdateSettings = async (updates: Partial<SafetySettings>) => {
    if (!user?.id || !settings) return;

    try {
      const updatedSettings = await safetyService.updateSettings(user.id, {
        ...settings,
        ...updates,
      });
      setSettings(updatedSettings);
      setError(null);
    } catch (err) {
      setError('Failed to update safety settings');
      console.error('Error updating safety settings:', err);
    }
  };

  const handleAddContact = async (contact: Omit<EmergencyContact, 'id' | 'verificationStatus' | 'verifiedAt' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.id || !settings) return;

    try {
      const newContact = await safetyService.addEmergencyContact(user.id, {
        ...contact,
        verificationStatus: 'pending' as VerificationStatus,
      });
      
      setSettings({
        ...settings,
        emergencyContacts: [...settings.emergencyContacts, newContact],
      });
      setShowContactForm(false);
      setError(null);
    } catch (err) {
      setError('Failed to add emergency contact');
      console.error('Error adding emergency contact:', err);
    }
  };

  const handleUpdateContact = async (contactId: string, updates: Partial<EmergencyContact>) => {
    if (!user?.id || !settings) return;

    try {
      const updatedContact = await safetyService.updateEmergencyContact(user.id, contactId, updates);
      setSettings({
        ...settings,
        emergencyContacts: settings.emergencyContacts.map(contact =>
          contact.id === contactId ? updatedContact : contact
        ),
      });
      setEditingContact(null);
      setError(null);
    } catch (err) {
      setError('Failed to update emergency contact');
      console.error('Error updating emergency contact:', err);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!user?.id || !settings) return;

    try {
      await safetyService.deleteEmergencyContact(user.id, contactId);
      setSettings({
        ...settings,
        emergencyContacts: settings.emergencyContacts.filter(contact => contact.id !== contactId),
      });
      setError(null);
    } catch (err) {
      setError('Failed to delete emergency contact');
      console.error('Error deleting emergency contact:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchSafetySettings}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Safety Center</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your safety settings and emergency contacts
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <SafetyFeatures
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          verificationStatus={settings.verificationStatus}
        />

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Emergency Contacts</h3>
            <button
              onClick={() => setShowContactForm(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Add Contact
            </button>
          </div>

          <EmergencyContactList
            contacts={settings.emergencyContacts}
            onEdit={setEditingContact}
            onDelete={handleDeleteContact}
          />
        </div>
      </div>

      {showContactForm && (
        <EmergencyContactForm
          onSubmit={handleAddContact}
          onCancel={() => setShowContactForm(false)}
        />
      )}

      {editingContact && (
        <EmergencyContactForm
          contact={editingContact}
          onSubmit={updates => handleUpdateContact(editingContact.id, updates)}
          onCancel={() => setEditingContact(null)}
        />
      )}

      {showSafetyCheck && (
        <SafetyCheckModal
          onClose={() => setShowSafetyCheck(false)}
          onComplete={fetchSafetySettings}
        />
      )}
    </div>
  );
};
