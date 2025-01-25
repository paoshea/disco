'use client';

import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { SafetyAlertProvider } from '@/contexts/SafetyAlertContext';

export default function SecurityPage() {
  return (
    <PublicLayout>
      <SafetyAlertProvider>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Safety &amp; Security
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Your safety is our top priority. Learn about our security
              measures.
            </p>
          </div>
          <div className="mt-12 prose prose-blue mx-auto">
            <h2>Our Commitment to Safety</h2>
            <p>
              At Disco, we prioritize the safety and security of our users. Our
              comprehensive safety features include real-time location sharing,
              emergency contacts, and 24/7 support.
            </p>
          </div>
        </div>
      </SafetyAlertProvider>
    </PublicLayout>
  );
}
