import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { OnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import { useAuth } from '@/contexts/AuthContext';

const SignupPage = () => {
  const router = useRouter();
  const { signup } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });

  const handleInitialSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signup({
        email: credentials.email,
        password: credentials.password,
        username: credentials.username,
        firstName: '',
        lastName: '',
      });
      setStep(1);
    } catch (err) {
      setError('Failed to create an account');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (userData: any) => {
    try {
      // Update user profile with onboarding data
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          ...userData,
          onboardingCompleted: step === 3,
          onboardingStep: step,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      if (step < 3) {
        setStep(step + 1);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setError('Failed to save your information. Please try again.');
    }
  };

  if (step > 0) {
    return (
      <Layout title="Complete Your Profile - DISCO!">
        <div className="min-h-screen bg-gray-50 py-12">
          <OnboardingSteps currentStep={step} onComplete={handleOnboardingComplete} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Sign Up - DISCO!">
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleInitialSignup}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={credentials.confirmPassword}
                  onChange={(e) =>
                    setCredentials({ ...credentials, confirmPassword: e.target.value })
                  }
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage;
