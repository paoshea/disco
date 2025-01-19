import { type FormEvent } from 'react';

/**
 * Creates a type-safe event handler that properly handles promises in React events
 * @param handler The async handler function
 * @returns A void-returning function suitable for React event handlers
 */
export function createEventHandler<E extends Event>(
  handler: (e: E) => Promise<void>
): (e: E) => void {
  return (e: E) => {
    void handler(e);
  };
}

/**
 * Creates a type-safe form submit handler that properly handles promises
 * @param handler The async form submission handler
 * @returns A void-returning function suitable for form onSubmit
 */
export function createFormSubmitHandler<T extends HTMLElement>(
  handler: (e: FormEvent<T>) => Promise<void>
): (e: FormEvent<T>) => void {
  return (e: FormEvent<T>) => {
    e.preventDefault();
    void handler(e);
  };
}

/**
 * Creates a type-safe callback that preserves the Promise return type
 * @param handler The async callback function
 * @returns A Promise-returning function with proper typing
 */
export function createPromiseCallback<Args extends unknown[], R>(
  handler: (...args: Args) => Promise<R>
): (...args: Args) => Promise<R> {
  return (...args: Args) => handler(...args);
}

/**
 * Creates a type-safe callback that converts a Promise-returning function to a void-returning one
 * @param handler The async callback function
 * @returns A void-returning function that internally handles the promise
 */
export function createAsyncCallback<Args extends unknown[]>(
  handler: (...args: Args) => Promise<void>
): (...args: Args) => void {
  return (...args: Args) => {
    void handler(...args);
  };
}
