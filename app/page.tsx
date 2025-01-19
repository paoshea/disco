'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';

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
                Your Safety Companion in Every Journey
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Disco your way to spontaneous new social connections.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg">Start Your Free Trial</Button>
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
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose Disco?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="Real-time Location Sharing"
                description="Share your location with trusted contacts in real-time, giving them peace of mind during your journeys."
                icon="🌍"
              />
              <FeatureCard
                title="Emergency Contacts"
                description="Set up emergency contacts who can be notified instantly if you need assistance."
                icon="⚡"
              />
              <FeatureCard
                title="Safety Check-ins"
                description="Schedule automatic check-ins and get reminders to confirm your safety."
                icon="✅"
              />
            </div>
          </div>
        </section>

        {/* Power Users Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Already a Disco User?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Welcome back! Sign in to access your personal safety dashboard and
                continue protecting what matters most.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/login">
                  <Button size="lg">Sign In to Your Account</Button>
                </Link>
                <Link href="/reset-password">
                  <Button variant="outline" size="lg">
                    Forgot Password?
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-sky-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of users who trust Disco for their personal safety.
            </p>
            <Link href="/signup">
              <Button size="lg">Create Your Account</Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="p-6 rounded-lg bg-gray-50 hover:bg-sky-50 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
