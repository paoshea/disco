'use client';

import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function FeaturesPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Features
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Discover what makes Disco special
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Real-time Chat
            </h3>
            <p className="mt-4 text-gray-600">
              Experience seamless, instant messaging with real-time updates and
              notifications.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900">
              File Sharing
            </h3>
            <p className="mt-4 text-gray-600">
              Share files, images, and documents securely with your team
              members.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Team Collaboration
            </h3>
            <p className="mt-4 text-gray-600">
              Create channels, groups, and organize your team communication
              effectively.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
