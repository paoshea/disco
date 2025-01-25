
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
      description: 'We are looking for a Senior Frontend Engineer to join our team and help build the next generation of our platform.',
      requirements: [
        'Proven experience with React and TypeScript',
        'Strong understanding of web performance optimization',
        'Experience with modern frontend tooling',
        'Excellent communication skills'
      ]
    },
    {
      title: 'Backend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Join our backend team to help scale our infrastructure and build new features.',
      requirements: [
        'Experience with Node.js and TypeScript',
        'Knowledge of database design and optimization',
        'Understanding of microservices architecture',
        'Problem-solving mindset'
      ]
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      description: 'Help shape the future of our product through thoughtful and innovative design.',
      requirements: [
        'Strong portfolio demonstrating UX/UI skills',
        'Experience with design systems',
        'User-centered design approach',
        'Collaboration skills'
      ]
    }
  ];

  return (
    <PublicLayout>
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Join Our Team
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Help us build the future of connection and safety
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-12">
              {openPositions.map((position, index) => (
                <div
                  key={index}
                  className="bg-white shadow overflow-hidden sm:rounded-lg"
                >
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {position.title}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {position.department} · {position.location} · {position.type}
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <p className="text-sm text-gray-500 mb-4">
                      {position.description}
                    </p>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Requirements:
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-500">
                        {position.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-6">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
