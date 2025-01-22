'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Logo } from '@/components/ui/Logo';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { register: signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const result = await signUp({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.success) {
        toast.success('Registration successful! Please check your email to verify your account.');
        router.push('/login');
      } else {
        console.log('Signup failed:', result.error);
        toast.error(result.error?.message || 'Registration failed');
        if (result.error?.message?.includes('already exists')) {
          form.reset();
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An unexpected error occurred during registration');
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
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <Input
                  {...form.register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
                {form.formState.errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <Input
                  {...form.register('name')}
                  id="name"
                  type="text"
                  autoComplete="name"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                />
                {form.formState.errors.name && (
                  <p className="mt-2 text-sm text-red-600">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <Input
                  {...form.register('password')}
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
                {form.formState.errors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm Password
                </label>
                <Input
                  {...form.register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                {...form.register('acceptTerms')}
                id="acceptTerms"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="acceptTerms"
                className="ml-2 block text-sm text-gray-900"
              >
                I accept the terms and conditions
              </label>
            </div>
            {form.formState.errors.acceptTerms && (
              <p className="mt-2 text-sm text-red-600">
                {form.formState.errors.acceptTerms.message}
              </p>
            )}

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? (
                  <LoadingSpinner className="w-5 h-5" />
                ) : (
                  'Sign up'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
