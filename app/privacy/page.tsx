'use client';

import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Learn how we protect your data and privacy
          </p>
        </div>
        <div className="mt-12 prose prose-blue mx-auto">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, including
            when you create an account, update your profile, or use our
            services.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve
            our services, and to enhance your experience on Disco.
          </p>

          <h2>3. Information Sharing</h2>
          <p>
            We do not sell your personal information. We may share your
            information in limited circumstances, such as with your consent or
            for legal purposes.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal
            information from unauthorized access or disclosure.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal
            information. Contact us to exercise these rights.
          </p>

          <h2>6. Updates to Privacy Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify
            you of any material changes.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}