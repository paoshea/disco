'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { SafetyAlertProvider } from '@/contexts/SafetyAlertContext';

export default function SecurityPage() {
  const { isLoading, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin?callbackUrl=/security');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <PublicLayout>
      <SafetyAlertProvider>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Safety &amp; Security
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Your safety is our top priority. Review and manage your security
              settings.
            </p>
          </div>
          {/* Security settings and content will go here */}
        </div>
      </SafetyAlertProvider>
    </PublicLayout>
  );
}
