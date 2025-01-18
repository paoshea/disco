'use client';

import { useEffect } from 'react';
import { Alert } from '@/components/ui/Alert';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Alert
        type="error"
        title="Something went wrong!"
        message="An unexpected error occurred. Please try again later."
      />
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
      >
        Try again
      </button>
    </div>
  );
}
