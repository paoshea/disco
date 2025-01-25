'use client';

import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function BlogPage() {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Our Blog
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Latest updates, stories and announcements
          </p>
        </div>
      </div>
    </div>
  );
}