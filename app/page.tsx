'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';
import {
  ShieldCheckIcon,
  UserGroupIcon,
  MapPinIcon,
  BellAlertIcon,
  LockClosedIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 text-sky-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <header className="fixed w-full top-0 bg-white/80 backdrop-blur-sm z-50 border-b shadow-sm">
        <nav className="container mx-auto px-4 h-16 flex justify-between items-center">
          <Logo />
          <div className="flex gap-4 items-center">
            <Link
              href="/features"
              className="text-gray-600 hover:text-gray-900"
            >
              Features
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content with proper spacing for fixed header */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent mb-6">
                Bring Back Serendipitous Encounters
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Disco your way to spontaneous new social connections.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg">Start Discovering</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              Discover What Makes Disco Special
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Meet like-minded people in your vicinity while maintaining
              complete control over your privacy and safety.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="Smart Discovery"
                description="Get notified when people sharing your interests are nearby. Set your radius from 100ft to 1 mile."
                icon={<MapPinIcon className="w-full h-full" />}
              />
              <FeatureCard
                title="Privacy First"
                description="End-to-end encrypted communications with zero personal data storage by default."
                icon={<LockClosedIcon className="w-full h-full" />}
              />
              <FeatureCard
                title="Safety Focused"
                description="Real-time safety check-ins, verified meeting spots, and emergency contact system."
                icon={<ShieldCheckIcon className="w-full h-full" />}
              />
              <FeatureCard
                title="Smart Matching"
                description="Find people based on shared interests, activities, and time windows that work for you."
                icon={<UserGroupIcon className="w-full h-full" />}
              />
              <FeatureCard
                title="Instant Alerts"
                description="Real-time notifications when potential matches are nearby, with customizable preferences."
                icon={<BellAlertIcon className="w-full h-full" />}
              />
              <FeatureCard
                title="Secure Chat"
                description="Private, encrypted conversations that automatically delete after 24 hours."
                icon={<ChatBubbleLeftRightIcon className="w-full h-full" />}
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-sky-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">How Disco Works</h2>
              <p className="text-lg text-gray-600 mb-12">
                Start discovering meaningful connections in just a few steps
              </p>
              <div className="space-y-8">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-1">
                      Create Your Profile
                    </h3>
                    <p className="text-gray-600">
                      Set up your interests, preferences, and discovery settings
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-1">
                      Enable Discovery Mode
                    </h3>
                    <p className="text-gray-600">
                      Get notified when compatible people are nearby
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-1">
                      Connect Safely
                    </h3>
                    <p className="text-gray-600">
                      Meet at verified public places with built-in safety
                      features
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Safety Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Safety is Our Priority
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We&apos;ve built comprehensive safety features into every aspect
                of Disco
              </p>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="p-6 bg-sky-50 rounded-xl">
                  <h3 className="font-semibold text-xl mb-3">
                    Privacy Protection
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• End-to-end encryption</li>
                    <li>• No location data storage</li>
                    <li>• Auto-deleting messages</li>
                    <li>• Customizable privacy zones</li>
                  </ul>
                </div>
                <div className="p-6 bg-sky-50 rounded-xl">
                  <h3 className="font-semibold text-xl mb-3">
                    Safety Features
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Verified meeting locations</li>
                    <li>• Real-time safety check-ins</li>
                    <li>• Emergency contact system</li>
                    <li>• 24/7 support team</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-sky-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Start Discovering?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join a community of people making meaningful connections
              every&nbsp;day.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg">Create Your Account</Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
