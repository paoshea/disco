'use client';

import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
  MapPinIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BellAlertIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

interface FeatureProps {
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
}

function FeatureSection({ title, description, features, icon }: FeatureProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-start bg-white p-8 rounded-xl shadow-sm">
      <div className="w-16 h-16 text-blue-600 flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckBadgeIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Features That Make Connection Safe
            </h1>
            <p className="text-xl text-gray-600">
              Discover all the powerful features that make Disco the perfect
              platform for creating meaningful connections.
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            <FeatureSection
              title="Smart Location"
              description="Find people nearby with intelligent location-based discovery."
              icon={<MapPinIcon className="w-full h-full" />}
              features={[
                'Real-time location updates',
                'Customizable search radius',
                'Privacy-focused location sharing',
                'Nearby event discovery',
                'Location verification',
              ]}
            />

            <FeatureSection
              title="Safety First"
              description="Your safety is our top priority with comprehensive protection."
              icon={<ShieldCheckIcon className="w-full h-full" />}
              features={[
                'Emergency contact system',
                'Real-time safety alerts',
                'Verified meeting places',
                '24/7 support team',
                'Community guidelines',
              ]}
            />

            <FeatureSection
              title="Smart Matching"
              description="Connect with like-minded individuals through our matching system."
              icon={<UserGroupIcon className="w-full h-full" />}
              features={[
                'Interest-based matching',
                'Compatibility scoring',
                'Mutual connection verification',
                'Profile verification',
                'Block and report features',
              ]}
            />
          </div>

          <div className="max-w-3xl mx-auto text-center mt-20">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg">Create Account</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}