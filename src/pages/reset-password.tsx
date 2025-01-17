import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

interface ResetPasswordFormData {
  email: string;
  token?: string;
  password?: string;
  confirmPassword?: string;
}

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const { resetPassword, requestPasswordReset } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      if (token) {
        if (!data.password || !data.confirmPassword) {
          throw new Error('Please enter your new password');
        }
        if (data.password !== data.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await resetPassword(token as string, data.password);
        setSuccess('Password has been reset successfully');
        setTimeout(async () => {
          try {
            await router.push('/login');
          } catch (err) {
            console.error('Navigation error:', err);
          }
        }, 2000);
      } else {
        await requestPasswordReset(data.email);
        setSuccess('Password reset instructions have been sent to your email');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {token ? 'Reset Your Password' : 'Forgot Password'}
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{success}</div>
          </div>
        )}

        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            void handleSubmit({
              email: formData.get('email') as string,
              password: formData.get('password') as string,
              confirmPassword: formData.get('confirmPassword') as string,
            });
          }}
        >
          <div className="space-y-4">
            {!token && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            )}

            {token && (
              <>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : token ? 'Reset Password' : 'Send Reset Instructions'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => void router.push('/login')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
