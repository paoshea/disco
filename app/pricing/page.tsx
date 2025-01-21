'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Handle loading state
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

  const handlePlanSelect = (planType: string) => {
    if (!user) {
      // Redirect to sign in if not authenticated
      router.push('/signin?callbackUrl=/pricing');
      return;
    }

    // Handle plan selection for authenticated users
    router.push(`/checkout?plan=${planType}`);
  };

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
                <span className="ml-3">Community support</span>
              </li>
            </ul>
            <button
              onClick={() => handlePlanSelect('free')}
              className="mt-8 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              {user ? 'Select Plan' : 'Sign in to Select'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg">
              Popular
            </div>
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
                <span className="ml-3">Priority support</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500">✓</span>
                <span className="ml-3">Advanced analytics</span>
              </li>
            </ul>
            <button
              onClick={() => handlePlanSelect('pro')}
              className="mt-8 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              {user ? 'Select Plan' : 'Sign in to Select'}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-900">Enterprise</h3>
            <p className="mt-4 text-4xl font-bold">Custom</p>
            <p className="mt-2 text-gray-600">Contact us for pricing</p>
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
              <li className="flex items-center">
                <span className="text-green-500">✓</span>
                <span className="ml-3">SLA guarantee</span>
              </li>
            </ul>
            <button
              onClick={() => handlePlanSelect('enterprise')}
              className="mt-8 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              {user ? 'Contact Sales' : 'Sign in to Contact'}
            </button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
