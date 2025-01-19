import { showToast } from '@/utils/toast';

export function useToast() {
  return {
    success: showToast.success,
    error: showToast.error,
    loading: showToast.loading,
    dismiss: showToast.dismiss,
  };
}

export type Toast = ReturnType<typeof useToast>;
