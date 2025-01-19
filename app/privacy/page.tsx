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
            <li>Files and attachments you share</li>
          </ul>

          <h3>Information automatically collected:</h3>
          <ul>
            <li>Device information</li>
            <li>Log data</li>
            <li>Usage information</li>
            <li>Cookies and similar technologies</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our service</li>
            <li>Improve and personalize your experience</li>
            <li>Communicate with you</li>
            <li>Ensure security and prevent fraud</li>
          </ul>

          <h2>Information Sharing and Disclosure</h2>
          <p>
            We do not sell your personal information. We may share your
            information in the following situations:
          </p>
          <ul>
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and prevent abuse</li>
            <li>With service providers who assist in providing the service</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal information against unauthorized access,
            alteration, disclosure, or destruction.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to processing of your information</li>
            <li>Data portability</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at <a href="mailto:privacy@disco.com">privacy@disco.com</a>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
