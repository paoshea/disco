import { SafetyCheckModal } from './SafetyCheckModal';
import { withAsyncHandler } from '../hoc/withAsyncHandler';
import type { ComponentProps } from 'react';

// Extract props type from the component
type SafetyCheckModalProps = ComponentProps<typeof SafetyCheckModal>;

// Create a void-returning version of the props
type VoidModalProps = Omit<SafetyCheckModalProps, 'onResolve'> & {
  onResolveAsync: (
    checkId: string,
    status: 'safe' | 'unsafe',
    notes?: string
  ) => void;
};

// Create the async wrapper that converts void to Promise
const AsyncModal = withAsyncHandler<SafetyCheckModalProps, VoidModalProps>(
  SafetyCheckModal,
  {
    onResolveAsync: 'onResolve',
  }
);

export const SafetyCheckModalAsync = AsyncModal;
