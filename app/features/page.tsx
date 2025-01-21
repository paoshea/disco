'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
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
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <div className="w-16 h-16 text-sky-600 flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckBadgeIcon className="w-6 h-6 text-sky-500 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-6"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <PublicLayout>
      <div className="py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent mb-6">
              Everything You Need for Safe Social Discovery
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover all the powerful features that make Disco the perfect
              platform for creating meaningful connections.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg">Get Started Free</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="max-w-5xl mx-auto space-y-20">
            <FeatureSection
              title="Smart Discovery"
              description="Find like-minded people nearby with our intelligent matching system."
              icon={<MapPinIcon className="w-full h-full" />}
              features={[
                'Real-time notifications for nearby matches',
                'Customizable radius from 100ft to 1 mile',
                'Activity-based matching for coffee, lunch, or quick chats',
                'Professional mode for networking-focused connections',
                'Smart filtering based on shared interests and preferences',
              ]}
            />

            <FeatureSection
              title="Privacy Protection"
              description="Your privacy is our top priority with state-of-the-art security measures."
              icon={<LockClosedIcon className="w-full h-full" />}
              features={[
                'Zero personal data storage by default',
                'End-to-end encrypted communications',
                'Approximate distance indicators only',
                'Customizable privacy zones',
                'Auto-deleting chat history after 24 hours',
              ]}
            />

            <FeatureSection
              title="Safety First"
              description="Comprehensive safety features to ensure secure and comfortable meetings."
              icon={<ShieldCheckIcon className="w-full h-full" />}
              features={[
                'Verified public meeting places through Google Places API',
                'Real-time safety check-ins during meetups',
                'Emergency contact system with one-tap activation',
                '24/7 human moderation and support',
                'AI-powered content and behavior monitoring',
              ]}
            />

            <FeatureSection
              title="Smart Matching"
              description="Connect with people who share your interests and schedule."
              icon={<UserGroupIcon className="w-full h-full" />}
              features={[
                'Customizable interest tags and categories',
                'Time-window preferences for availability',
                'Activity-based matching preferences',
                'Professional networking filters',
                'Community rating system with mandatory feedback',
              ]}
            />

            <FeatureSection
              title="Instant Notifications"
              description="Never miss a potential connection with smart alerts."
              icon={<BellAlertIcon className="w-full h-full" />}
              features={[
                'Real-time match notifications',
                'Customizable alert preferences',
                'Battery-efficient background operation',
                'Optional Bluetooth proximity detection',
                'Smart notification scheduling',
              ]}
            />

            <FeatureSection
              title="Secure Communication"
              description="Private and secure messaging system for safe interactions."
              icon={<ChatBubbleLeftRightIcon className="w-full h-full" />}
              features={[
                'End-to-end encrypted messaging',
                '24-hour message auto-deletion',
                'AI-powered content moderation',
                'Rich media sharing capabilities',
                'In-app voice and video verification',
              ]}
            />
          </div>

          {/* CTA Section */}
          <div className="max-w-3xl mx-auto text-center mt-20">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Start Discovering?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of users making meaningful connections every day.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg">Create Your Account</Button>
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
    </PublicLayout>
  );
}
