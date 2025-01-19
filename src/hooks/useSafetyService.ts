import { useState, useCallback } from 'react';
import { safetyService } from '@/services/api/safety.service';
import type {
  EmergencyContact,
  SafetyCheck,
  SafetyCheckNew,
  SafetyCheckStatus,
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
    async (contact: Omit<EmergencyContact, 'id'>) => {
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
    async (contactId: string, updates: Partial<EmergencyContact>) => {
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

  const getSafetyChecks = useCallback(async () => {
    if (!user?.id) throw new Error('User ID is required');
    setIsLoading(true);
    setError(null);
    try {
      const checks = await safetyService.getSafetyChecks(user.id);
      return checks;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch safety checks'
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const createSafetyCheck = useCallback(
    async (check: Omit<SafetyCheckNew, 'id'>) => {
      if (!user?.id) throw new Error('User ID is required');
      setIsLoading(true);
      setError(null);
      try {
        // Convert SafetyCheckNew to SafetyCheck format
        const checkData: Omit<SafetyCheck, 'id'> = {
          userId: user.id,
          status:
            check.status === 'completed'
              ? 'safe'
              : check.status === 'pending'
                ? 'pending'
                : ('missed' as SafetyCheckStatus),
          scheduledTime: check.scheduledFor,
          location: check.location,
          notes: check.description,
          notifiedContacts: [], // Initialize empty array for notified contacts
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: check.completedAt,
        };
        const newCheck = await safetyService.createSafetyCheck(
          user.id,
          checkData
        );
        return newCheck;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create safety check'
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
    getSafetyChecks,
    createSafetyCheck,
  };
}
