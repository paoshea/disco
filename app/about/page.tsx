'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function AboutPage() {
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
            About Disco
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Building the future of team communication
          </p>
        </div>

        <div className="mt-16">
          <div className="prose prose-blue max-w-none">
            <h2>Our Mission</h2>
            <p>
              At Disco, we believe that great teamwork starts with great
              communication. Our mission is to make team collaboration seamless,
              enjoyable, and productive.
            </p>

            <h2 className="mt-12">Our Story</h2>
            <p>
              Founded in 2025, Disco was born from the need for a more intuitive
              and efficient way for teams to communicate. We&apos;ve grown from
              a small startup to a platform trusted by teams worldwide.
            </p>

            <h2 className="mt-12">Our Values</h2>
            <ul>
              <li>Transparency in everything we do</li>
              <li>Privacy and security first</li>
              <li>Continuous innovation</li>
              <li>User-centered design</li>
              <li>Building lasting relationships</li>
            </ul>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900">Leadership Team</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Team member cards would go here */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Philip O&apos;Shea FCA
              </h3>
              <p className="text-gray-600">CEO & Co-founder</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Aidan O&apos;Shea
              </h3>
              <p className="text-gray-600">CTO & Co-founder</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Leonardo di Freites
              </h3>
              <p className="text-gray-600">Head of Product</p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
