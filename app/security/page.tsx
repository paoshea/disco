'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function SecurityPage() {
  const { status } = useSession();
  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Security
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Your security and privacy are our top priorities
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900">
              End-to-End Encryption
            </h3>
            <p className="mt-4 text-gray-600">
              All messages and files are encrypted in transit and at rest using
              industry-standard encryption.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Two-Factor Authentication
            </h3>
            <p className="mt-4 text-gray-600">
              Add an extra layer of security to your account with 2FA support.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Regular Security Audits
            </h3>
            <p className="mt-4 text-gray-600">
              We regularly conduct security audits and penetration testing to
              ensure your data is safe.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900">
            Our Security Practices
          </h2>
          <div className="mt-8 prose prose-blue max-w-none">
            <ul>
              <li>Regular security updates and patches</li>
              <li>Secure data centers with 24/7 monitoring</li>
              <li>Compliance with industry standards</li>
              <li>Regular employee security training</li>
              <li>Incident response plan</li>
            </ul>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
