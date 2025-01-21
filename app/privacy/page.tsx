'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Last updated: January 18, 2025
          </p>
        </div>

        <div className="mt-16 prose prose-blue max-w-none">
          <h2>Introduction</h2>
          <p>
            At Disco, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our service.
          </p>

          <h2>Information We Collect</h2>
          <h3>Information you provide to us:</h3>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Profile information</li>
            <li>Communication content</li>
          </ul>

          <h3>Information we automatically collect:</h3>
          <ul>
            <li>Device information</li>
            <li>Usage data</li>
            <li>Location data (when enabled)</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Improve user experience</li>
            <li>Send important updates and notifications</li>
            <li>Analyze usage patterns</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your data.
            However, no method of transmission over the internet is 100% secure.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of certain data collection</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
