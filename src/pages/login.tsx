import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const router = useRouter();
  const { login, user, isLoading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user) {
      router.push('/profile');
    }
  }, [user, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      router.push('/profile');
    } catch (err) {
      // Error is handled by the AuthContext
      console.error('Login failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{' '}
              <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                create a new account
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <Input
                  label="Email address"
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

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full"
              >
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
