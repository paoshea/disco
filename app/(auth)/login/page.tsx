/* eslint-disable @typescript-eslint/no-misused-promises, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ToastTitle, ToastDescription } from '@/components/ui/toast';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginValues) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(data);

      if (!result) {
        toast.success('Login Successful');
        router.push('/dashboard');
        return;
      }

      // If we get here, result is an Error
      setError(result.message);
      toast.error('Login Failed', {
        description: result.message,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An error occurred during login';
      setError(message);
      toast.error('Login Failed', {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <Logo />
          <h2 className="mt-6 text-3xl font-extrabold bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              href="/signup"
              className="font-medium text-sky-600 hover:text-sky-500 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {error && (
            <Alert
              type="error"
              title="Login Error"
              message={error}
              className="mb-4"
            />
          )}

          <div className="space-y-4">
            <div>
              <Input
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                {...register('password')}
                error={errors.password?.message}
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
              Sign in
            </Button>
          </div>

          <div className="text-sm text-center">
            <Link
              href="/reset-password"
              className="font-medium text-sky-600 hover:text-sky-500 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
