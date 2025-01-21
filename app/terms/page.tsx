'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Last updated: January 18, 2025
          </p>
        </div>

        <div className="mt-16 prose prose-blue max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Disco, you agree to be bound by these Terms
            of Service and all applicable laws and regulations. If you do not
            agree with any of these terms, you are prohibited from using the
            service.
          </p>

          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily access and use Disco for
            personal, non-commercial transitory viewing only. This is the grant
            of a license, not a transfer of title.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            To use certain features of the service, you must register for an
            account. You agree to:
          </p>
          <ul>
            <li>Provide accurate information</li>
            <li>Maintain the security of your account</li>
            <li>Promptly update your account information</li>
            <li>Be responsible for all activities under your account</li>
          </ul>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for any unlawful purpose</li>
            <li>Harass, abuse, or harm others</li>
            <li>Interfere with or disrupt the service</li>
            <li>Attempt to gain unauthorized access</li>
          </ul>

          <h2>5. Content</h2>
          <p>
            You retain all rights to the content you post on Disco. By posting
            content, you grant us a license to use, modify, and display that
            content as needed to provide the service.
          </p>

          <h2>6. Service Modifications</h2>
          <p>
            We reserve the right to modify or discontinue the service at any
            time, with or without notice. We shall not be liable to you or any
            third party for any modification, suspension, or discontinuance.
          </p>

          <h2>7. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the service
            immediately, without prior notice, for conduct that we believe
            violates these Terms or is harmful to other users, us, or third
            parties.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            In no event shall Disco be liable for any indirect, incidental,
            special, consequential, or punitive damages arising out of or
            relating to your use of the service.
          </p>

          <h2>9. Contact Information</h2>
          <p>
            Questions about the Terms of Service should be sent to us at{' '}
            <a href="mailto:legal@disco.com">legal@disco.com</a>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
