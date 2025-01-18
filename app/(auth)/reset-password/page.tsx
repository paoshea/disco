'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const requestResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RequestResetFormData = z.infer<typeof requestResetSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? null;
  const { resetPassword, requestPasswordReset } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestResetForm = useForm<RequestResetFormData>({
    resolver: zodResolver(requestResetSchema),
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleRequestReset = async (data: RequestResetFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await requestPasswordReset(data.email);
      setSuccess('Password reset instructions have been sent to your email.');
      requestResetForm.reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to request password reset'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Reset token is missing');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await resetPassword(token, data.password);
      setSuccess('Password has been successfully reset');
      resetPasswordForm.reset();
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
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
              {token ? 'Reset Your Password' : 'Request Password Reset'}
            </h2>
          </div>

          {!token ? (
            <form
              onSubmit={() => void requestResetForm.handleSubmit(handleRequestReset)()}
              className="mt-8 space-y-6"
            >
              <div>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  error={requestResetForm.formState.errors.email?.message}
                  {...requestResetForm.register('email')}
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              {success && (
                <div className="text-green-500 text-sm text-center">
                  {success}
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </Button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={() => void resetPasswordForm.handleSubmit(handleResetPassword)()}
              className="mt-8 space-y-6"
            >
              <div className="space-y-4">
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="New password"
                  error={resetPasswordForm.formState.errors.password?.message}
                  {...resetPasswordForm.register('password')}
                />
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="Confirm new password"
                  error={
                    resetPasswordForm.formState.errors.confirmPassword?.message
                  }
                  {...resetPasswordForm.register('confirmPassword')}
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              {success && (
                <div className="text-green-500 text-sm text-center">
                  {success}
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
