import { useState, useCallback } from 'react';
import { safetyService } from '@/services/api/safety.service';
import type {
  EmergencyContact,
  EmergencyContactInput,
  SafetyCheck,
  SafetyCheckNew,
  SafetyCheckStatus,
  SafetyCheckInput,
} from '@/types/safety';
import { useAuth } from '@/hooks/useAuth';

export function useSafetyService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getEmergencyContacts = useCallback(async () => {
    if (!user?.id) throw new Error('User ID is required');
    setIsLoading(true);
    setError(null);
    try {
      const contacts = await safetyService.getEmergencyContacts(user.id);
      return contacts;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch emergency contacts'
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const addEmergencyContact = useCallback(
    async (contact: EmergencyContactInput) => {
      if (!user?.id) throw new Error('User ID is required');
      setIsLoading(true);
      setError(null);
      try {
        const newContact = await safetyService.addEmergencyContact(
          user.id,
          contact
        );
        return newContact;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to add emergency contact'
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  const updateEmergencyContact = useCallback(
    async (contactId: string, updates: Partial<EmergencyContactInput>) => {
      if (!user?.id) throw new Error('User ID is required');
      setIsLoading(true);
      setError(null);
      try {
        const updatedContact = await safetyService.updateEmergencyContact(
          user.id,
          contactId,
          updates
        );
        return updatedContact;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to update emergency contact'
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  const deleteEmergencyContact = useCallback(
    async (contactId: string) => {
      if (!user?.id) throw new Error('User ID is required');
      setIsLoading(true);
      setError(null);
      try {
        await safetyService.deleteEmergencyContact(user.id, contactId);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to delete emergency contact'
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  const scheduleSafetyCheck = useCallback(
    async (check: SafetyCheckInput) => {
      if (!user?.id) throw new Error('User ID is required');
      setIsLoading(true);
      setError(null);
      try {
        const newCheck = await safetyService.createSafetyCheck(user.id, check);
        return newCheck;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to schedule safety check'
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  return {
    isLoading,
    error,
    getEmergencyContacts,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    scheduleSafetyCheck,
  };
}
