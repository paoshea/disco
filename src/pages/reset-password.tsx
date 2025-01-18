import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ResetPasswordFormData {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const ResetPasswordPage = () => {
  const router = useRouter();
  const { token } = router.query;
  const { resetPassword, requestPasswordReset } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data: ResetPasswordFormData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    void (async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (token) {
          if (!data.password || !data.confirmPassword) {
            throw new Error('Please enter your new password');
          }
          if (data.password !== data.confirmPassword) {
            throw new Error('Passwords do not match');
          }
          await resetPassword(token as string, data.password);
          setSuccess(
            'Password has been reset successfully. You can now log in with your new password.'
          );
          setTimeout(() => {
            void router.push('/login');
          }, 3000);
        } else {
          if (!data.email) {
            throw new Error('Please enter your email address');
          }
          await requestPasswordReset(data.email);
          setSuccess('Password reset instructions have been sent to your email.');
        }
      } catch (err) {
        console.error('Password reset error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    })();
  };

  return (
    <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              {token ? 'Reset Your Password' : 'Forgot Your Password?'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {token
                ? 'Enter your new password below'
                : 'Enter your email address and we will send you a password reset link'}
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {!token && (
                <div>
                  <Input
                    label="Email address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>
              )}

              {token && (
                <>
                  <div>
                    <Input
                      label="New password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      label="Confirm new password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? token
                  ? 'Resetting Password...'
                  : 'Sending Reset Link...'
                : token
                  ? 'Reset Password'
                  : 'Send Reset Link'}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;
