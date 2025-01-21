import { useState } from 'react';
import { safetyService } from '@/services/api/safety.service';
import type { EmergencyContactFormData } from '@/types/safety';
import type { User } from '@/types/user';

interface UseSafetyServiceProps {
  user: User;
}

interface SafetyServiceState {
  loading: boolean;
  error: string | null;
}

export function useSafetyService({ user }: UseSafetyServiceProps) {
  const [state, setState] = useState<SafetyServiceState>({
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const addEmergencyContact = async (contact: EmergencyContactFormData) => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const updateEmergencyContact = async (
    contactId: string,
    contact: EmergencyContactFormData
  ) => {
    try {
      setLoading(true);
      const updatedContact = await safetyService.updateEmergencyContact(
        user.id,
        contactId,
        contact
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
      setLoading(false);
    }
  };

  const deleteEmergencyContact = async (contactId: string) => {
    try {
      setLoading(true);
      await safetyService.deleteEmergencyContact(user.id, contactId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete emergency contact'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    ...state,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
  };
}
