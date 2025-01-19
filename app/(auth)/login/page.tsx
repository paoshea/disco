'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { useRouter } from 'next/navigation';
import { useAsyncSubmit } from '@/hooks/useAsyncHandler';
import type { FormEvent } from 'react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
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

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      setIsLoading(true);
      setNeedsVerification(false);

      try {
        const result = await login(data.email, data.password);

        if (result.error) {
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

        if (result.success) {
          toast.success('Login successful! Redirecting...');
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Login error:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred during login';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [login, router]
  );

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

  const handleSubmitForm = useAsyncSubmit<HTMLFormElement>(e => handleSubmit(onSubmit)(e));

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <Logo className="h-12 mx-auto" />
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold text-center mb-8">
                  Welcome Back
                </h1>
              </div>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmitForm}>
              <div className="space-y-4">
                <div>
                  <Input
                    id="email"
                    type="email"
                    label="Email address"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                <div>
                  <Input
                    id="password"
                    type="password"
                    label="Password"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  loading={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>

            {needsVerification && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Need another verification email?
                </p>
                <Button
                  onClick={handleResendVerification}
                  variant="secondary"
                  className="w-full"
                  disabled={isLoading}
                >
                  Resend Verification Email
                </Button>
              </div>
            )}

            <div className="mt-4 text-center">
              <Link
                href="/signup"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Don&apos;t have an account? Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
