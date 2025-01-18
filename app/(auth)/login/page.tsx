'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { LoginResult } from '@/lib/auth';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const [needsVerification, setNeedsVerification] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState<string>('');
  const returnTo = searchParams?.get('returnTo') ?? '/dashboard';

  const { register, handleSubmit, watch } = useForm<LoginFormData>();
  const email = watch('email');

  useEffect(() => {
    // Check for verification success message
    const verified = searchParams?.get('verified') === 'true';
    if (verified) {
      toast.success('Email verified successfully! Please log in.');
    }
  }, [searchParams]);

  const handleResendVerification = async () => {
    if (!emailForVerification) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForVerification }),
      });

      if (!response.ok) throw new Error('Failed to resend verification email');

      toast.success('Verification email sent! Please check your inbox.');
    } catch (err) {
      toast.error('Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    setNeedsVerification(false);

    try {
      const result = (await login(data.email, data.password) as unknown) as LoginResult;

      if ('error' in result && result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      if ('needsVerification' in result && result.needsVerification) {
        setNeedsVerification(true);
        setEmailForVerification(data.email);
        toast.warning('Please verify your email before logging in.');
        return;
      }

      if ('token' in result && result.token) {
        // Store the token and redirect
        localStorage.setItem('token', result.token);
        router.push(returnTo);
      } else {
        setError('Login failed: No token received');
        toast.error('Login failed: No token received');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 mb-4">
              <img src="/images/disco-logo.svg" alt="Disco Logo" className="w-full h-full" />
            </div>
            <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
              Welcome back!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                href="/signup"
                className="font-medium text-sky-600 hover:text-sky-500 transition-colors"
              >
                create a new account
              </Link>
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-6"
          >
            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  disabled={isLoading}
                  className="rounded-lg"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              <div>
                <Input
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  disabled={isLoading}
                  className="rounded-lg"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-sky-600 hover:text-sky-500 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {needsVerification && (
              <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">
                      Email verification required
                    </h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>
                        Please check your email for a verification link. If you
                        haven't received it,{' '}
                        <button
                          type="button"
                          onClick={handleResendVerification}
                          className="font-medium text-amber-800 underline hover:text-amber-600 transition-colors"
                          disabled={isLoading}
                        >
                          click here to resend
                        </button>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-500 to-sky-700 hover:from-sky-600 hover:to-sky-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner className="w-5 h-5" /> : 'Sign in'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
