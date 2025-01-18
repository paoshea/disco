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
import { Logo } from '../../../src/components/ui/Logo';
import { useRouter } from 'next/navigation';

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

  const handleResendVerification = useCallback(async () => {
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
  }, [emailForVerification]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <Logo priority />
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

          <form
            className="mt-8 space-y-6"
            onSubmit={e => {
              e.preventDefault();
              void handleSubmit(onSubmit)(e);
            }}
          >
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
        </div>
      </div>
    </div>
  );
}
