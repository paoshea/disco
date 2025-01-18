import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <header className="fixed w-full top-0 bg-white/80 backdrop-blur-sm z-50 border-b">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo priority />
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent mb-6">
              Your Safety Companion in Every Journey
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Disco helps you stay connected with loved ones and ensures your
              safety, no matter where life takes you.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg">Start Your Free Trial</Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg">
                  Learn More
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo className="text-white" />
              <p className="mt-4 text-gray-400">
                Making personal safety accessible and easy for everyone.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#features">Features</Link>
                </li>
                <li>
                  <Link href="/pricing">Pricing</Link>
                </li>
                <li>
                  <Link href="/security">Security</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
                <li>
                  <Link href="/careers">Careers</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms of Service</Link>
                </li>
                <li>
                  <Link href="/contact">Contact Us</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Disco. All rights reserved.</p>
          </div>
        </div>
      </footer>
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
