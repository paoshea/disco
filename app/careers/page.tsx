'use client';

import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function CareersPage() {
  const openPositions = [
    {
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'San Francisco, CA',
      type: 'Full-time',
    },
    {
      title: 'Technical Support Engineer',
      department: 'Customer Success',
      location: 'Remote',
      type: 'Full-time',
    },
  ];

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Join Our Team
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Help us build the future of team communication
          </p>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900">Why Disco?</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Remote-First
              </h3>
              <p className="mt-4 text-gray-600">
                Work from anywhere in the world. We believe in hiring the best
                talent, regardless of location.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Great Benefits
              </h3>
              <p className="mt-4 text-gray-600">
                Competitive salary, equity, health insurance, and unlimited PTO.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900">Growth</h3>
              <p className="mt-4 text-gray-600">
                Learn and grow with a team of talented individuals who are
                passionate about their work.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900">Open Positions</h2>
          <div className="mt-8 grid gap-6">
            {openPositions.map((position, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {position.title}
                    </h3>
                    <p className="mt-2 text-gray-600">{position.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">{position.location}</p>
                    <p className="text-gray-600">{position.type}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
