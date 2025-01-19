'use client';

import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function PricingPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Pricing Plans
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Choose the perfect plan for your team
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-900">Free</h3>
            <p className="mt-4 text-4xl font-bold">$0</p>
            <p className="mt-2 text-gray-600">per user/month</p>
            <ul className="mt-6 space-y-4">
              <li className="flex items-center">
                <span className="text-green-500">✓</span>
                <span className="ml-3">Basic chat features</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500">✓</span>
                <span className="ml-3">Up to 10 team members</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500">✓</span>
                <span className="ml-3">1GB storage</span>
              </li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500">
            <h3 className="text-2xl font-semibold text-gray-900">Pro</h3>
            <p className="mt-4 text-4xl font-bold">$10</p>
            <p className="mt-2 text-gray-600">per user/month</p>
            <ul className="mt-6 space-y-4">
              <li className="flex items-center">
                <span className="text-green-500">✓</span>
                <span className="ml-3">All Free features</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500">✓</span>
                <span className="ml-3">Unlimited team members</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500">✓</span>
                <span className="ml-3">10GB storage</span>
              </li>
            </ul>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-900">Enterprise</h3>
            <p className="mt-4 text-4xl font-bold">Custom</p>
            <p className="mt-2 text-gray-600">contact for pricing</p>
            <ul className="mt-6 space-y-4">
              <li className="flex items-center">
                <span className="text-green-500">✓</span>
                <span className="ml-3">All Pro features</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500">✓</span>
                <span className="ml-3">Custom integrations</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500">✓</span>
                <span className="ml-3">Dedicated support</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
