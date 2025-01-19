import { useCallback } from 'react';

/**
 * Custom hook to handle async operations in event handlers
 * @param asyncFn The async function to handle
 * @returns A void-returning function that safely handles the promise
 */
export function useAsyncHandler<Args extends unknown[]>(
  asyncFn: (...args: Args) => Promise<void>
): (...args: Args) => void {
  return useCallback(
    (...args: Args) => {
      void asyncFn(...args);
    },
    [asyncFn]
  );
}

/**
 * Custom hook for handling form submissions with async operations
 * @param onSubmit The async submit handler
 * @returns A form submit handler that prevents default and handles the promise
 */
export function useAsyncSubmit<T>(
  onSubmit: (e: React.FormEvent<T>) => Promise<void>
): (e: React.FormEvent<T>) => void {
  return useCallback(
    (e: React.FormEvent<T>) => {
      e.preventDefault();
      void onSubmit(e);
    },
    [onSubmit]
  );
}

/**
 * Custom hook for handling async operations that need to return a promise
 * @param handler The async handler function
 * @returns A function that preserves the promise chain
 */
export function usePromiseHandler<Args extends unknown[], R>(
  handler: (...args: Args) => Promise<R>
): (...args: Args) => Promise<R> {
  return useCallback((...args: Args) => handler(...args), [handler]);
}
