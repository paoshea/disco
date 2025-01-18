'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import type { RegisterData } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { register: signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const registerData: RegisterData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      };

      await signUp(registerData);
      router.push('/chat');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred during registration'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              void signupForm.handleSubmit(handleSignup)(e);
            }}
          >
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    placeholder="First name"
                    error={signupForm.formState.errors.firstName?.message}
                    {...signupForm.register('firstName')}
                  />
                </div>
                <div>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    placeholder="Last name"
                    error={signupForm.formState.errors.lastName?.message}
                    {...signupForm.register('lastName')}
                  />
                </div>
              </div>
              <div>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  error={signupForm.formState.errors.email?.message}
                  {...signupForm.register('email')}
                />
              </div>
              <div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Password"
                  error={signupForm.formState.errors.password?.message}
                  {...signupForm.register('password')}
                />
              </div>
              <div>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Confirm password"
                  error={signupForm.formState.errors.confirmPassword?.message}
                  {...signupForm.register('confirmPassword')}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner /> : 'Create account'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
