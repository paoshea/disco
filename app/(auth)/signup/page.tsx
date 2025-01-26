'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Logo } from '@/components/ui/Logo';
import { useState } from 'react';

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

export default function SignupPage() {
  const { register: signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
  });

  const handleSignup = async (data: z.infer<typeof signupSchema>) => {
    setIsLoading(true);

    try {
      const registerData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      };

      console.log('Starting signup...');
      const result = await signUp(registerData);
      console.log('Signup result:', result);

      if (!result) {
        throw new Error('No response from signup service');
      }

      if (result.success) {
        console.log('Signup successful, preparing to redirect...');

        toast.success(
          'Account created successfully! Check your email for verification instructions.'
        );

        // Use replace instead of push to prevent back navigation to signup
        router.replace('/dashboard');
        router.refresh();
      } else {
        console.log('Signup failed:', result.error);
        // Handle specific error cases
        if (result.error?.includes('503')) {
          toast.error('Unable to connect to database. Please try again in a moment.');
        } else {
          toast.error(
            `Registration failed: ${result.error || 'Please try again.'}`
          );
        }

        // Reset the form on conflict
        if (result.error?.includes('already exists')) {
          form.reset();
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      let errorMessage = 'An error occurred during registration';

      // Handle specific error cases
      if (err instanceof Error) {
        if (
          err.message.includes('409') ||
          err.message.includes('already exists')
        ) {
          errorMessage = 'An account with this email already exists';
          form.reset();
        } else {
          errorMessage = err.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex justify-center">
              <Logo />
            </div>
          </div>
          <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            Join Disco today
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-sky-600 hover:text-sky-500 transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>

          <form
            onSubmit={e => {
              e.preventDefault();
              void form.handleSubmit(handleSignup)(e);
            }}
            className="mt-8 space-y-6"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    placeholder="First name"
                    className="rounded-lg"
                    error={form.formState.errors.firstName?.message}
                    {...form.register('firstName')}
                  />
                </div>
                <div>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    placeholder="Last name"
                    className="rounded-lg"
                    error={form.formState.errors.lastName?.message}
                    {...form.register('lastName')}
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
                  className="rounded-lg"
                  error={form.formState.errors.email?.message}
                  {...form.register('email')}
                />
              </div>
              <div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Password"
                  className="rounded-lg"
                  error={form.formState.errors.password?.message}
                  {...form.register('password')}
                />
              </div>
              <div>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Confirm password"
                  className="rounded-lg"
                  error={form.formState.errors.confirmPassword?.message}
                  {...form.register('confirmPassword')}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-500 to-sky-700 hover:from-sky-600 hover:to-sky-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner className="w-5 h-5" />
                ) : (
                  'Create account'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
