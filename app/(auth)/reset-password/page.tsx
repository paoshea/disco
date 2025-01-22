'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? null;
  const { resetPassword, requestPasswordReset } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Reset token is missing');
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await resetPassword(token, data.password);

      if (result.success) {
        setSuccess('Password has been successfully reset');
      } else {
        setError(result.error?.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async (email: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await requestPasswordReset(email);

      if (result.success) {
        setSuccess('Password reset instructions have been sent to your email');
      } else {
        setError(result.error?.message || 'Failed to request password reset');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
        <p className="mb-4">
          Enter your email address and we'll send you instructions to reset your
          password.
        </p>
        <form
          onSubmit={e => {
            e.preventDefault();
            const email = (e.target as HTMLFormElement).email.value;
            void handleRequestReset(email);
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
      {success ? (
        <div className="bg-green-50 p-4 rounded mb-4">
          <p className="text-green-800">{success}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value =>
                  value === watch('password') || 'Passwords do not match',
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 p-4 rounded mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}
