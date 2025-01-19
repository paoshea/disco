import { useCallback } from 'react';

/**
 * Hook to create an event handler that safely handles promises
 * @param handler The async handler function
 * @returns A void-returning event handler that wraps the async function
 */
export function useEventCallback<Args extends unknown[]>(
  handler: (...args: Args) => Promise<void>
): (...args: Args) => void {
  return useCallback(
    (...args: Args) => {
      void handler(...args);
    },
    [handler]
  );
}
