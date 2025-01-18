'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResult {
  error?: string;
  needsVerification?: boolean;
}

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);
    setNeedsVerification(false);

    try {
      const loginResponse = await login(data.email, data.password);
      const result = loginResponse as unknown as LoginResult;

      if ('error' in result && result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      if (result.needsVerification) {
        setNeedsVerification(true);
        setEmailForVerification(data.email);
        toast.error(
          'Please verify your email address before logging in. Check your inbox for a verification link.'
        );
        return;
      }

      // Successful login will redirect automatically
      toast.success('Login successful!');
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 mb-4">
              <Image
                src="/images/disco-logo.svg"
                alt="Disco Logo"
                width={96}
                height={96}
                priority
                className="w-full h-full"
              />
            </div>
            <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
              Welcome back!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-sky-600 hover:text-sky-500"
              >
                Sign up
              </Link>
            </p>
          </div>

          <form
            onSubmit={void handleSubmit(onSubmit)}
            className="mt-8 space-y-6"
          >
            <div className="space-y-4">
              <div>
                <Input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  error={errors.email?.message}
                />
              </div>

              <div>
                <Input
                  {...register('password')}
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  error={errors.password?.message}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-sky-600 hover:text-sky-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-500 to-sky-700 hover:from-sky-600 hover:to-sky-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>

            {needsVerification && (
              <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Please verify your email
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Check your inbox for a verification link. Need a new
                        link?{' '}
                        <button
                          type="button"
                          className="font-medium text-yellow-800 underline"
                          onClick={() => void handleResendVerification()}
                          disabled={isLoading}
                        >
                          Resend verification email
                        </button>
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
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
